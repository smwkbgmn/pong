import asyncio
import random
import pymunk

class PongPhysic:
	def __init__(self, channel_layer, group, match):
		self.group = group
		self.match = match
		self.channel_layer = channel_layer

		self.player = {"left": None, "right": None}
		self.score = {"left": 0, "right": 0}
		self.goal = 3
		
		self.ball_speed_default = 3
		self.ball_speed_increment = 0.5
		self.ball_out_of_bound = (7, 5)

		self.paddle_random_bounce_scale = 0.3

		self.setup()

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
				mod = 1 + ((random.random() - 0.5) * self.paddle_random_bounce_scale)
				direction = (direction[0], direction[1] * mod)

				self.update_ball_velocity(direction, speed)
			
			self.ball.body.velocity = self.ball.body.velocity.normalized() * (speed + self.ball_speed_increment)

	def update_ball_velocity(self, direction, speed):
		velocity = (direction[0] * speed, direction[1] * speed)
		self.ball.body.velocity = velocity

	async def update_game_state(self):
		await self.out_of_bound()

		game_state = {
			"type"						: "game_update",
			"player"					: self.player,
			"score"						: self.score,
			"ball_position"				: {"x": self.ball.body.position.x, "y": self.ball.body.position.y},
			"left_paddle_position_y"	: self.paddle_left_body.position.y,
			"right_paddle_position_y"	: self.paddle_right_body.position.y
		}

		await self.channel_layer.group_send(self.match['game_id'], game_state)

	async def out_of_bound(self):
		if abs(self.ball.body.position.x) > self.ball_out_of_bound[0] \
		or abs(self.ball.body.position.y) > self.ball_out_of_bound[1]:
			self.score['left' if self.ball.body.position.x < 0 else 'right'] += 1
			await self.finish() if self.goal in self.score.values() else self.reset_ball()
	
	def reset_ball(self):
		self.ball.body.position = 0, 0
		direction = (1 if random.random() > 0.5 else -1,(random.random() - 0.5) * 2)

		self.update_ball_velocity(direction, self.ball_speed_default)

	async def finish(self):
		self.running = False
		if self.task and not self.task.done():
			self.task.cancel()
			self.task = None
		
		side = "left" if self.score['left'] > self.score['right'] else "right"

		self.group['players'].remove(self.player['left' if side == "right" else 'right'])
		self.match['winner'] = self.player[side]

		print(self.match['game_id'], ">> sending game_finish event")
		await self.channel_layer.group_send(self.match['game_id'], {"type": "game_finish"})

	### METHOD DERIVED BY EVENT ### 
	async def move_paddle(self, player, moved_y):
		paddle_body = self.paddle_left_body if player == self.player["left"] else self.paddle_right_body
		paddle_body.position = (paddle_body.position.x, moved_y)

	async def add_player(self, channel_name, side):
		self.player[side] = channel_name
		
		if self.player['left'] and self.player['right']:
			await self.start()

	async def start(self):
		self.running = True
		self.task = asyncio.create_task(self.schedule())

		print(self.match['game_id'], ">> game has created!")
		self.reset_ball()

	async def schedule(self):
		while self.running:
			self.space.step(1/60)
			await self.update_game_state()
			await asyncio.sleep(1/60)
