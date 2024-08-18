import json
import random

from channels.generic.websocket import AsyncWebsocketConsumer
from datetime import datetime
from .PongServer import PongServer

class Consumer(AsyncWebsocketConsumer):
	queue = {}
	tourn = {}
	games = {}

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)

		self.connection	= False

		self.player		= None
		self.tourn_size	= None
		self.tourn_id	= None
		self.match		= None

	@staticmethod
	def generate_id():
		timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
		random_suffix = ''.join(random.choices('abcdefghijklmnopqrstuvwxyz', k=5))

		return f"{timestamp}_{random_suffix}"

	def log(self, prefix, context):
		time = datetime.now().strftime("%H:%M:%S")

		if prefix == 'channel':
			print(f"{time} [{self.channel_name[-12:]}] {context}")
		else: print(f"{time} [{prefix}] {context}")

	### CONNECTION ###
	async def connect(self):
		await self.accept()
		self.connection = True

	async def disconnect(self, close_code):
		self.log('channel', f"disconnected with code {close_code}")

		self.connection = False
		await self.clear_instance()

	async def clear_instance(self):
		if self.tourn_id:
			await self.channel_layer.group_discard(self.tourn_id, self.channel_name)

			if self.match: await self.clear_match()
				
			if len(self.tourn[self.tourn_id]['players']) == 0:
				self.tourn[self.tourn_id] = None
		elif self.tourn_size:
			self.queue[self.tourn_size].remove(self.player)
	
	async def clear_match(self):
		self.match['player1' if self.match['player1'] and self.match['player1']['channel'] == self.channel_name else 'player2'] = None

		self.channel_layer.group_discard(self.match['game_id'], self.channel_name)
		
		if self.match['game_id'] in self.games:
			game = self.games[self.match['game_id']]
			if game.running: await game.player_disconnect(self.channel_name)
			elif not self.match['player1'] and not self.match['player2']:
				await game.finish(None)
				del self.games[self.match['game_id']]
		
		if not self.match['player1'] and not self.match['player2']:
			self.tourn[self.tourn_id]['matches'].remove(self.match)
		
	### RECEIVE FROM CLIENT ###
	async def receive(self, text_data):
		data = json.loads(text_data)

		if data['type'] == 'requestMatch':
			await self.handle_request_match(data)
		elif data['type'] == 'joinRoom':
			await self.handle_join_room(data['gameId'], data['side'])
		elif data['type'] == 'playerMove':
			await self.handle_player_move(data['movedY'])
	
	async def handle_request_match(self, data):
		self.log('consumer', f"receive match request from {self.channel_name[-12:]}")
		
		tourn_size = data['tournamentSize']

		if tourn_size in self.queue and \
			data['playerName'] in [player['name'] for player in self.queue[tourn_size]]:
			await self.send(json.dumps({
					'type'	: 'user_already_on_queue'
				}))
			await self.close_connection()
			return
			
		self.player = {
			'channel'	: self.channel_name,
			'name'		: data['playerName'],
			'image'		: data['playerImage']
		}

		# For disconnection if in queue
		self.tourn_size = tourn_size

		if tourn_size not in self.queue:
			self.queue[tourn_size] = []
		
		self.queue[tourn_size].append(self.player)
		
		if len(self.queue[tourn_size]) == tourn_size:
			await self.tournament_start(tourn_size)
		else:
			await self.send(json.dumps({
				'type'			: 'waiting_for_players',
				'curnt_players'	: len(self.queue[tourn_size]),
				'tourn_size'	: tourn_size
			}))

	async def tournament_start(self, tourn_size):
		self.log('consumer', f"starting tournament for size {tourn_size}")

		players = self.queue[tourn_size]
		self.queue[tourn_size] = []

		tourn_id = f"tourn_{self.generate_id()}"
		self.tourn[tourn_id] = {
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
			await self.channel_layer.group_add(match['game_id'], match['player1']['channel'])
			if match['player2']:
				await self.channel_layer.group_add(match['game_id'], match['player2']['channel'])
				self.games[match['game_id']] = PongServer(self.channel_layer, self.tourn[tourn_id], match, self.log)

			await self.channel_layer.group_send(match['game_id'], {
				'type'		: 'match_start',
				'game_id'	: match['game_id'],
				'player1'	: match['player1'],
				'player2'	: match['player2'],
			})
	
	def matches_create(self, players):
		self.log('consumer', "creating matches")

		matches = []
		for i in range(0, len(players), 2):
			matches.append({
				'game_id'	: f"game_{self.generate_id()}",
				'player1'	: players[i],
				'player2'	: players[i + 1] if i + 1 < len(players) else None,
				'winner'	: None
			})

		self.log('consumer', f"{len(matches)} matches has created")
		return matches
	
	async def handle_join_room(self, game_id, side):
		await self.games[game_id].add_player(self.match['player1' if side == "left" else 'player2'], side)

	async def handle_player_move(self, moved_y):
		await self.games[self.match['game_id']].move_paddle(self.channel_name, moved_y)

	### RECEIVE FROM SERVER (== GROUP_SEND) ###
	async def assign_group(self, event):
		self.tourn_id = event['tourn_id']

	async def match_start(self, event):
		self.log('channel', "receive game_start from consumer")

		game_id = event['game_id']
		self.match = next(match for match in self.tourn[self.tourn_id]['matches'] if match['game_id'] == game_id)

		if event['player2']:
			# self.games[game_id] = PongServer(self.channel_layer, self.tourn[self.tourn_id], self.match, self.log)

			side = 'left' if self.channel_name == event['player1']['channel'] else 'right'
			opnt = event['player2' if side == 'left' else 'player1']
			await self.send(json.dumps({
				'type'		: 'match_found',
				'game_id'	: game_id,
				'side'		: side,
				'opnt_name'	: opnt['name'],
				'opnt_image': opnt['image'],
				'players'	: self.tourn[self.tourn_id]['players']
			}))
		else:
			self.match['winner'] = 'player1'
			await self.game_finish({'walkover': True})

	async def score_change(self, event):
		await self.send(json.dumps(event))

	async def game_update(self, event):
		if self.connection: await self.send(json.dumps(event))

	async def game_finish(self, event):
		self.log('channel', "receive game_finish from game")

		await self.send(json.dumps({
			'type'		: 'game_finish',
			'walkover'	: event['walkover']
		}))

		if self.match[self.match['winner']]['channel'] == self.channel_name:
			del self.games[self.match['game_id']]
			await self.round_in()
		else: await self.round_out()

	async def round_in(self):
		if all(match['winner'] is not None for match in self.tourn[self.tourn_id]['matches']):
			# The way of tarvaling matches and get all the winners is more not error prone
			winners = []
			for match in self.tourn[self.tourn_id]['matches']:
				if match[match['winner']]: winners.append(match[match['winner']])

			self.tourn[self.tourn_id]['players'] = winners

			# It seems more simpler but there a issue for usage of the list at
			# creating next round with disconnecting and the concurrency of removal
			# winners = self.tourn[self.tourn_id]['players']

			if len(winners) == 1:
				await self.send(json.dumps({'type': 'tournament_win'}))
				await self.close_connection()
			else: await self.matches_start(winners, self.tourn_id)
		else: await self.send(json.dumps({'type': 'round_wait'}))
			
	async def round_out(self):
		await self.send(json.dumps({'type': 'round_end'}))
		await self.close_connection()
		
	async def close_connection(self):
		# Because of the delay of calling socket disconnect method, the 
		# connection value should be assigned at here for more smooth control
		self.connection = False
		await self.close()