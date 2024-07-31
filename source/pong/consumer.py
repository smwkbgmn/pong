import json
import random

from channels.generic.websocket import AsyncWebsocketConsumer
from datetime import datetime
from .physics import PongPhysic

class Consumer(AsyncWebsocketConsumer):
	queue = {}
	tourn = {}
	games = {}

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)

		self.connection	= False

		self.tourn_size	= None
		self.tourn_id	= None
		self.match		= None

	@staticmethod
	def generate_id():
		timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
		random_suffix = ''.join(random.choices('abcdefghijklmnopqrstuvwxyz', k=5))

		return f"{timestamp}_{random_suffix}"

	### CONNECTION ###
	async def connect(self):
		await self.accept()

		self.connection = True

	async def disconnect(self, close_code):
		print(f"{self.channel_name[-12:]} | disconnected with code {close_code}")
		self.connection = False

		# if the normal disconnection
		if close_code == 1000:  return;

		# player has assigned at tournament
		if self.tourn_id:
			print(f"{self.channel_name[-12:]} | clearing tournament info")
			self.tourn[self.tourn_id]['players'].remove(self.channel_name)

			if len(self.tourn[self.tourn_id]['players']) == 0:
				self.tourn[self.tourn_id] = None

			await self.channel_layer.group_discard(self.tourn_id, self.channel_name)

			# player has received the match_start event so the game would be created at this time
			if self.match:
				print(f"{self.channel_name[-12:]} | clearing game info")
				game = self.games[self.match['game_id']]

				# when disconnection if opponent players has assigned as "disconnect", it means both player are not shown
				if game.player['left' or 'right'] == "disconnect": del self.games[self.match['game_id']]
				else: game.player_disconnect(self.channel_name)
				
				# at here, the matches_create has done but didn't send match_start yet
				# so the matches info should be modified as correctly and should be going with AI
				# Or? just send this game as walkover game with timeout handling on joining game
				# maybe in 10sec, if both player has not appear, go through walkover or handle the players
				# if self.tourn[self.tourn_id]['matches']:

		elif self.channel_name in self.queue[self.tourn_size]:
			print(f"{self.channel_name[-12:]} | clearing cueue info")
			self.queue[self.tourn_size].remove(self.channel_name)

	async def receive(self, text_data):
		data = json.loads(text_data)

		match data['type']:
			case 'requestMatch'	: await self.handle_request_match(data)
			case 'joinRoom'		: await self.handle_join_room(data['gameId'], data['side'])
			case 'playerMove'	: await self.handle_player_move(data['movedY'])
	
	### RECEIVE FROM CLIENT ###
	async def handle_request_match(self, data):
		print(f"consumer | receive match request from {self.channel_name[-12:]}")

		tourn_size = data['tournamentSize']

		# for disconnection if in queue
		self.tourn_size = tourn_size

		if tourn_size not in self.queue:
			self.queue[tourn_size] = []
		
		# self.queue[tourn_size].append(self.channel_name)
		self.queue[tourn_size].append({
			'channel'	: self.channel_name,
			'name'		: data['playerName'],
			'image'		: data['playerImage']
		})
		
		if len(self.queue[tourn_size]) == tourn_size:
			await self.tournament_start(tourn_size)
		else:
			await self.send(json.dumps({
				'type'			: 'waiting_for_players',
				'curnt_players'	: len(self.queue[tourn_size]),
				'tourn_size'	: tourn_size
			}))

	async def tournament_start(self, tourn_size):
		print(f"consumer | starting tournament for size {tourn_size}")

		players = self.queue[tourn_size]
		self.queue[tourn_size] = []

		tourn_id = f"tourn_{self.generate_id()}"
		self.tourn[tourn_id] = {
			# 'size'			: tourn_size,
			'players'		: players,
			'matches'		: [],
		}
		
		for player in players:
			await self.channel_layer.group_add(tourn_id, player['channel'])
		
		await self.channel_layer.group_send(tourn_id, {
			'type'		: 'assign_group',
			'tourn_id'	: tourn_id
		})

		await self.matches_start(players, tourn_id)
	
	async def matches_start(self, players, tourn_id):
		matches = self.matches_create(players)
		self.tourn[tourn_id]['matches'] = matches
		
		for match in matches:
			await self.channel_layer.group_add(match['game_id'], match['player1'])
			await self.channel_layer.group_add(match['game_id'], match['player2'])
			await self.channel_layer.group_send(match['game_id'], {
				'type'		: 'match_start',
				'game_id'	: match['game_id'],
				'player1'	: match['player1'],
				'player2'	: match['player2'],
			})
	
	def matches_create(self, players):
		print("consumer | creating matches")

		matches = []
		for i in range(0, len(players), 2):
			matches.append({
				'game_id'	: f"game_{self.generate_id()}",
				'player1'	: players[i],
				'player2'	: players[i + 1] if i + 1 < len(players) else None,
				'winner'	: None
			})
		return matches
	
	async def handle_join_room(self, game_id, side):
		await self.games[game_id].add_player(self.channel_name, side)

	async def handle_player_move(self, moved_y):
		await self.games[self.match['game_id']].move_paddle(self.channel_name, moved_y)

	### SERVER-SIDE EVENT (== GROUP_SEND) ###
	async def assign_group(self, event):
		self.tourn_id = event['tourn_id']

	async def match_start(self, event):
		print(f"{self.channel_name[-12:]} | receive game_start from consumer")

		game_id = event['game_id']

		self.match = next(match for match in self.tourn[self.tourn_id]['matches'] if match['game_id'] == game_id)
		self.games[game_id] = PongPhysic(self.channel_layer, self.tourn[self.tourn_id], self.match)

		opponent = event['player2' if self.channel_name == event['player1']['channel'] else 'player1']

		await self.send(json.dumps({
			'type'		: 'match_found',
			'game_id'	: game_id,
			'side'		: "left" if self.channel_name == event['player1']['channel'] else "right",
			'opnt_name'	: opponent['name'],
			'opnt_image': opponent['image']
		}))

	# async def player_info(self, event):
	# 	await self.send(json.dumps(event))

	async def score_change(self, event):
		await self.send(json.dumps(event))

	async def game_update(self, event):
		if self.connection: await self.send(json.dumps(event))

	async def game_finish(self, event):
		print(f"{self.channel_name[-12:]} | receive game_finish from game")
		
		await self.send(json.dumps({'type': 'game_finish'}))
		await self.channel_layer.group_discard(self.match['game_id'], self.channel_name)

		if self.match['winner'] == self.channel_name:
			await self.round_in()
		else:
			await self.round_out()

	async def round_in(self):
		if all(match['winner'] is not None for match in self.tourn[self.tourn_id]['matches']):
			winners = self.tourn[self.tourn_id]['players']

			if len(winners) == 1:
				self.tourn[self.tourn_id]['players'].remove(self.channel_name)
				await self.send(json.dumps({'type': 'tournament_win'}))
				await self.close_connection()
			else:
				await self.matches_start(winners, self.tourn_id)
		else:
			await self.send(json.dumps({'type': 'round_wait'}))
			
	async def round_out(self):
		await self.send(json.dumps({'type': 'round_end'}))
		await self.close_connection()
		
	async def close_connection(self):
		self.connection = False
		
		await self.clear_instance()
		await self.close()

	async def clear_instance(self):
		if self.match['game_id'] in self.games:
			del self.games[self.match['game_id']]

		await self.channel_layer.group_discard(self.tourn_id, self.channel_name)
		if self.tourn[self.tourn_id] and len(self.tourn[self.tourn_id]['players']) == 0:
			self.tourn[self.tourn_id] = None

		# self.tourn_id = None
