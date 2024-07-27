import json
import random

from channels.generic.websocket import AsyncWebsocketConsumer
from datetime import datetime
from .physics import PongPhysic
class Consumer(AsyncWebsocketConsumer):
	queue	= {}
	group 	= {}
	game	= {}

	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)

		self.connection	= False
		self.group_id	= None
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

	# async def disconnect(self):
	# 	self.connection = False

	# 	if self.channel_name in self.queue: self.queue.remove(self.channel_name)
	# 	if self.group_id:
	# 		await self.channel_layer.group_discard(self.group_id, self.channel_name)

	async def receive(self, text_data):
		data = json.loads(text_data)

		match data['type']:
			case 'requestMatch'	: await self.handle_request_match(data['tournamentSize'])
			case 'joinRoom'		: await self.handle_join_room(data['gameId'], data['side'])
			case 'playerMove'	: await self.handle_player_move(data['movedY'])
	
	### RECEIVE FROM CLIENT ###
	async def handle_request_match(self, tourn_size):
		print("consumer >> receive match request from", self.channel_name)

		if tourn_size not in self.queue:
			self.queue[tourn_size] = []
		
		self.queue[tourn_size].append(self.channel_name)
		
		if len(self.queue[tourn_size]) == 2:
			await self.tournament_start(tourn_size)
		else:
			await self.send(json.dumps({
				'type'			: 'waiting_for_players',
				'curnt_players'	: len(self.queue[tourn_size]),
				'tourn_size'	: tourn_size
			}))

	async def tournament_start(self, tourn_size):
		print("consumer >> starting tournament for size", tourn_size)

		players = self.queue[tourn_size]
		self.queue[tourn_size] = []

		group_id = f"tourn_{self.generate_id()}"
		self.group[group_id] = {
			'players'		: players,
			'matches'		: [],
		}
		
		for player in players:
			await self.channel_layer.group_add(group_id, player)
		
		await self.channel_layer.group_send(group_id, {
			'type'		: 'assign_group',
			'group_id'	: group_id
		})

		await self.matches_start(players, group_id)
	
	async def matches_start(self, players, group_id):
		matches = self.matches_create(players)
		self.group[group_id]['matches'] = matches
		
		for match in matches:
			await self.channel_layer.group_add(match['game_id'], match['player1'])
			await self.channel_layer.group_add(match['game_id'], match['player2'])
			await self.channel_layer.group_send(match['game_id'], {
				'type'			: 'match_start',
				'game_id'		: match['game_id'],
				'player1'		: match['player1'],
				'player2'		: match['player2'],
			})
	
	def matches_create(self, players):
		print("consumer >> creating matches")

		matches = []
		for i in range(0, len(players), 2):
			if i + 1 < len(players):
				game_id = f"game_{self.generate_id()}"
				matches.append({
					'game_id'	: game_id,
					'player1'	: players[i],
					'player2'	: players[i + 1],
					'winner'	: None
				})
			else:
				matches.append({
					'game_id'	: None,
					'player1'	: players[i],
					'player2'	: None,
					'winner'	: players[i]
				})
		return matches
	
	async def handle_join_room(self, game_id, side): await self.game[game_id].add_player({'channel': self.channel_name, 'name': "Hello", 'image': 'image uri'}, side)
	async def handle_player_move(self, moved_y): await self.game[self.match['game_id']].move_paddle(self.channel_name, moved_y)

	### SERVER-SIDE EVENT (== GROUP_SEND) ###
	async def assign_group(self, event): self.group_id = event['group_id']

	async def match_start(self, event):
		print(self.channel_name, ">> receive game_start from consumer")

		game_id = event['game_id']

		self.match = next(match for match in self.group[self.group_id]['matches'] if match['game_id'] == game_id)
		self.game[game_id] = PongPhysic(self.channel_layer, self.group[self.group_id], self.match)

		await self.send(json.dumps({
			'type'	: 'match_found',
			'gameId': game_id,
			'side'	: "left" if self.channel_name == event['player1'] else "right",
		}))

	async def player_info(self, event): await self.send(json.dumps(event))
	async def score_change(self, event): await self.send(json.dumps(event))

	async def game_update(self, event):
		if self.connection: await self.send(json.dumps(event))

	async def game_finish(self, event):
		print(self.channel_name, ">> receive game_finish from game")
		
		await self.send(json.dumps({'type': 'game_finish'}))
		await self.channel_layer.group_discard(self.match['game_id'], self.channel_name)

		if self.match['winner'] == self.channel_name:
			del self.game[self.match['game_id']]
			await self.round_in()
		else:
			await self.round_out()

	async def round_in(self):
		if all(match['winner'] is not None for match in self.group[self.group_id]['matches']):
			winners = self.group[self.group_id]['players']

			if len(winners) == 1:
				await self.send(json.dumps({'type': 'tournament_win'}))

				self.channel_layer.group_discard(self.group_id, self.channel_layer)
				self.group[self.group_id] = None
				self.close()
			else:
				await self.matches_start(winners, self.group_id)
		else:
			await self.send(json.dumps({'type': 'round_wait'}))
			
	async def round_out(self):
		self.connection = False

		await self.send(json.dumps({'type': 'round_end'}))
		await self.channel_layer.group_discard(self.group_id, self.channel_name)
		await self.close()
