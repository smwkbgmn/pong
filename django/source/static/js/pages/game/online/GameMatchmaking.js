import Component from '../../../core/Component.js'
import PongClient from "../../../components/PongClient.js";
import * as Event from '../../../core/Event.js'
import * as Utils from '../../../Utils.js'

import { setSocket, getSocket } from './SharedSocket.js';

export default class GameMatchmaking extends Component {
	constructor($target, $props) {
		super($target, $props);

		if (Utils.getParsedItem('prevHash') == '#set_player_num/'
			&& Utils.getParsedItem('playerNum')) {
			this.setupSocket();
		}
		else
			Utils.changeFragment('#set_player_num/');
	}

	setUp() {
		this.$state = {
			idx: 2,
			isError: false,
			isOnQueue: false,
			isMatchFound: false,
		};
		this.timer = 0;
		this.gameStart = false;

		this.playerNum = Utils.getParsedItem('playerNum');

		this.textList = [
			'다른 참가자를 기다리는 중입니다.',
			'다른 참가자를 기다리는 중입니다..',
			'다른 참가자를 기다리는 중입니다...'
		];

		this.changeMessage(this.$state.idx);
	}

	unmounted() {
		console.log('matchmaking unmounted');

		if (getSocket() && this.$state.isMatchFound == false) {
			this.closeSocket();
			this.clearSocket();
		}
		
		this.clearEvent();
	}

	template() {
		const { idx, isError, isOnQueue } = this.$state;

		let message;
		if (isError == true)
			message = '서버에 연결할 수 없습니다.';
		else if (isOnQueue == true)
			message = '이미 게임 중입니다.';
		else
			message = this.textList[idx];

		let button = '';
		if (isError == false || isOnQueue == true)
			button = '돌아가기';

		return `			
			<div class="main-div">
				<p class="main-p">토너먼트</p>
				
				<a class="home-a" href="#/">
					<img class="home-img" src="/static/asset/home-icon.png">
				</a>
			
				<p class="message-p">${message}</p>
				
				<button class="exit-btn">${button}</button>

				<div class="matchmaking-container"></div>
				<div class="game-container"></div>
			</div>
		`;
	}

	setEvent() {
		this.unmountedBinded = Event.addHashChangeEvent(this.unmounted.bind(this));
		this.clearTimeoutWrapped = Event.addHashChangeEvent(clearTimeout.bind(this, this.timer));
		this.clickedExitButtonWrapped = Event.addEvent(this.$target, 'click', '.exit-btn', this.clickedExitButton.bind(this));
	}

	clearEvent() {
		Event.removeHashChangeEvent(this.unmountedBinded);
		Event.removeHashChangeEvent(this.clearTimeoutWrapped);
		Event.removeEvent(this.$target, 'click', this.clickedExitButtonWrapped);
	}

	clickedExitButton() {
		const socket = getSocket();
		if (socket && socket.readyState === WebSocket.OPEN)
			socket.close();
		if (this.$state.isOnQueue == true)
			return Utils.changeFragment('#set_player_num/');
	}

	changeMessage(prev) {
		if (this.gameStart == false
			&& window.location.hash == '#game_matchmaking/') {

			this.setState({ idx: (prev + 1) % 3 });
			this.timer = setTimeout(this.changeMessage.bind(this, this.$state.idx), 800);
		}
	}

	setupSocket() {
		this.socket = new WebSocket('wss://' + window.location.host + '/ws/pong');
		const socket = this.socket;
		// console.log(socket);

		socket.onopen = (event) => {
			socket.send(JSON.stringify({
				type				: 'requestMatch',
				tournamentSize		: this.playerNum,
				playerName			: Utils.getParsedItem('playerName'),
				playerImage			: Utils.getParsedItem('playerImage'),
			}));
		};

		socket.onmessage = (event) => {
			const data = JSON.parse(event.data);

			switch(data.type) {
				case 'waiting_for_players':
					break;

				case 'match_found':
					this.gameStart = true;
					Utils.setStringifiedItem('gameStart', false);
					Utils.setStringifiedItem('gameData', data);
					Utils.changeFragment('#game_match/');
					this.$state.isMatchFound = true;
					break;

				case 'user_already_on_queue':
					console.log("on queue");
					this.setState({ isOnQueue: true });
			}
		};

		socket.onclose = (event) => {
			if (this.$state.isOnQueue == false)
				return Utils.changeFragment('#set_player_num/');
		};

		socket.onerror = function(error) {
			this.setState({ isError: true });
			return Utils.changeFragment('#set_player_num/');
		};

		setSocket(socket);
	}

	closeSocket() {
		if (this.socket.readyState === WebSocket.OPEN)
			this.socket.close();		
	}

	clearSocket() {
		// if (this.socket) {
		// 	if (this.socket.readyState === WebSocket.OPEN)
		// 		this.socket.close();
		// 	this.socket = null;
		// 	setSocket(null);
		// }
		if (getSocket() == this.socket)
			setSocket(null);
		this.socket = null;
	}

}