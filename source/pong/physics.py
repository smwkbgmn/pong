import asyncio
import random
import pymunk

class PongPhysic:
	def __init__(self, channel_layer, tourn, match):
		self.tourn = tourn
		self.match = match
		self.channel_layer = channel_layer

		self.wait_time = 5

		self.task_wait = None
		self.task_update = None

		self.player = {"left": None, "right": None}
		self.score = {"left": 0, "right": 0}
		self.goal = 5

		self.ball_speed_default = 3
		self.ball_speed_increment = 0.5
		self.ball_random_bounce_scale = 0.3 # (rand -50 ~ +50)% * 0.3 = (-17 ~ +17)% modulation
		self.ball_out_of_bound = {'x': 5, 'y': 7}

		self.setup()
		# self.timer_on()

	def setup(self):
		self.space 							= pymunk.Space()
		self.space.gravity 					= (0, 0)

		ball_body 							= pymunk.Body(1, 1)
		ball_body.position 					= (0, 0)
		self.ball 							= pymunk.Circle(ball_body, 0.1)
		self.ball.elasticity 				= 1

		paddle_mass 						= 1000 
		paddle_moment 						= pymunk.moment_for_box(paddle_mass, (0.2, 1))

		self.paddle_left_body 				= pymunk.Body(paddle_mass, paddle_moment, body_type=pymunk.Body.KINEMATIC)
		self.paddle_left_body.position		= (-4.5, 0)
		self.paddle_left					= pymunk.Poly.create_box(self.paddle_left_body, (0.2, 1))
		self.paddle_left.elasticity 		= 1

		self.paddle_right_body 				= pymunk.Body(paddle_mass, paddle_moment, body_type=pymunk.Body.KINEMATIC)
		self.paddle_right_body.position 	= (4.5, 0)
		self.paddle_right 					= pymunk.Poly.create_box(self.paddle_right_body, (0.2, 1))
		self.paddle_right.elasticity 		= 1

		self.wall_top 						= pymunk.Segment(self.space.static_body, (-4, -5), (4, -5), 0.05)
		self.wall_bottom 					= pymunk.Segment(self.space.static_body, (-4, 5), (4, 5), 0.05)
		self.wall_top.elasticity 			= self.wall_bottom.elasticity = 1

		self.space.add(ball_body, self.ball,
			self.paddle_left_body, self.paddle_left,
			self.paddle_right_body, self.paddle_right,
			self.wall_top, self.wall_bottom)
		
		self.space.add_collision_handler(0, 0).post_solve = self.handle_collision

	def handle_collision(self, arbiter, space, data):
		if self.ball in (arbiter.shapes[0], arbiter.shapes[1]):
			speed = self.ball.body.velocity.length

			if self.paddle_left in (arbiter.shapes[0], arbiter.shapes[1]) or \
				self.paddle_right in (arbiter.shapes[0], arbiter.shapes[1]):

				direction = self.ball.body.velocity.normalized()
				mod = 1 + ((random.random() - 0.5) * self.ball_random_bounce_scale)
				direction = (direction[0], direction[1] * mod)

				self.update_ball_velocity(direction, speed)
			
			self.ball.body.velocity = self.ball.body.velocity.normalized() * (speed + self.ball_speed_increment)

	def update_ball_velocity(self, direction, speed):
		velocity = (direction[0] * speed, direction[1] * speed)
		self.ball.body.velocity = velocity

	def timer_on(self):
		self.task_wait = asyncio.create_task(self.wait_for_player)
	
	async def wait_for_player(self):
		await asyncio.sleep(self.wait_time)

		if self.is_dead('left' and 'right'): await self.finish("nobody")
		elif self.is_dead('left' or 'right'): await self.finish(self.player['left' if self.is_dead('right') else 'right'])

	def is_dead(self, side): return self.player[side] == None or "disconnect"

	async def update_game_state(self):
		await self.handle_out_of_bound()

		game_state = {
			"type"						: "game_update",
			"ball_position"				: {"x": self.ball.body.position.x, "y": self.ball.body.position.y},
			"left_paddle_position_y"	: self.paddle_left_body.position.y,
			"right_paddle_position_y"	: self.paddle_right_body.position.y
		}
		await self.channel_layer.group_send(self.match['game_id'], game_state)

	async def handle_out_of_bound(self):
		if abs(self.ball.body.position.x) > self.ball_out_of_bound['x'] \
		or abs(self.ball.body.position.y) > self.ball_out_of_bound['y']:
			self.score['left' if self.ball.body.position.x > 0 else 'right'] += 1
			await self.channel_layer.group_send(self.match['game_id'], {
				"type"	: "score_change",
				"score"	: self.score
			})
			await self.finish(None) if self.goal in self.score.values() else self.reset_ball()
	
	def reset_ball(self):
		self.ball.body.position = 0, 0
		direction = (1 if random.random() > 0.5 else -1,(random.random() - 0.5) * 2)

		self.update_ball_velocity(direction, self.ball_speed_default)

	async def finish(self, walkover):
		self.running = False
		if self.task_wait: self.task_wait.cancel()
		elif self.task_update: self.task_update.cancel()
		# if self.task_update and not self.task_update.done():

		if walkover == "nobody": self.tourn['matches'].remove(self.match)
		else:
			if walkover: winner_side = "left" if self.player['left'] == walkover else "right"
			else:
				winner_side = "left" if self.score['left'] > self.score['right'] else "right"
				self.tourn['players'].remove(self.player['left' if winner_side == "right" else 'right'])

			self.match['winner'] = self.player[winner_side]

			print(f"{self.match['game_id']} | sending game_finish event")
			await self.channel_layer.group_send(self.match['game_id'], {"type": "game_finish"})

	### METHOD DERIVEN BY EVENT ### 
	async def add_player(self, channel_name, side):
		self.player[side] = channel_name
		
		if self.player['left'] and self.player['right']:
			if self.task_wait:
				self.task_wait.cancel()
				self.task_wait = None
			# await self.send_player_info()
			await self.start()

	# async def send_player_info(self): 
	# 	await self.channel_layer.group_send(self.match['game_id'], {
	# 		"type"	: "player_info",
	# 		"left"	: {
	# 			"name"	: self.player['left']['name'],
	# 			"image"	: self.player['left']['image']
	# 		},
	# 		"right"	: {
	# 			"name"	: self.player['right']['name'],
	# 			"image"	: self.player['right']['image']
	# 		}
	# 	})

	async def start(self):
		self.running = True
		self.task_update = asyncio.create_task(self.schedule())

		print(f"{self.match['game_id']} | game has started!")
		self.reset_ball()

	async def schedule(self):
		while self.running:
			self.space.step(1/60)
			await self.update_game_state()
			await asyncio.sleep(1/60)

	async def move_paddle(self, player, moved_y):
		paddle_body = self.paddle_left_body if player == self.player["left"] else self.paddle_right_body
		paddle_body.position = (paddle_body.position.x, moved_y)

	async def player_disconnect(self, channel_name):
		print(f"{self.match['game_id']} | taking player_disconnect")
		await self.channel_layer.group_discard(self.match['game_id'], channel_name)

		# means the game is ongoing
		if not self.task_wait:
			print(f"{self.match['game_id']} | handle in ongoing game")
			await self.finish(channel_name)
		# or in timer, the other player could be in or not. either way
		# need to be assigned as None to disconnected player for correct
		# handling after time of waiting because it uses the player state
		else:
			print(f"{self.match['game_id']} | handle in wating state")
			self.player['left' if self.player['left'] == channel_name else 'right'] = "disconnect"