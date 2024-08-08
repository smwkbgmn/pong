import Component from '../../../core/Component.js'
import PongClient from "../../../components/PongClient.js";
import * as Event from '../../../core/Event.js'
import * as Utils from '../../../Utils.js'
import * as GameUtils from "../GameUtils.js"

import { setSocket, getSocket } from './SharedSocket.js';

export default class GameMatchmaking extends Component {
	constructor($target, $props) {
		super($target, $props);

		this.setupSocket();
	}

	setUp() {
		this.$state = {
			idx: 2,
			isError: false,
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


	template() {
		const { idx, isError } = this.$state;

		let message;
		if (isError == true)
			message = '서버에 연결할 수 없습니다.';
		else
			message = this.textList[idx];

		let button = '';
		if (isError == false)
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
	}

	changeMessage(prev) {
		if (this.gameStart == false
			&& window.location.hash == '#game_matchmaking/') {

			this.setState({ idx: (prev + 1) % 3 });
			this.timer = setTimeout(this.changeMessage.bind(this, this.$state.idx), 800);
		}
	}

	setupSocket() {
		let socket = new WebSocket('ws://' + window.location.host + '/ws/pong');
		// console.log(socket);

		socket.onopen = (event) => {
			socket.send(JSON.stringify({
				type				: 'requestMatch',
				tournamentSize		: this.playerNum,
				playerName			: Utils.getParsedItem('playerName'),
				playerImage			: Utils.getParsedItem('playerImage'),
				// userTokenAccess		: Utils.getParsedItem('accessToken'),
				// userTokenRefresh	: Utils.getParsedItem('refreshToken')
			}));
		};

		// 다른 플레이어 기다리던 도중의 이벤트 핸들링
		socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			// console.log("in matchmaking");
			// console.log(data);

			switch(data.type) {
				case 'waiting_for_players':
					break;

				case 'match_found':
					this.gameStart = true;
					Utils.setStringifiedItem('gameStart', false);
					Utils.setStringifiedItem('gameData', data);
					Utils.changeFragment('#game_match/'); //error
					break;
			}
		};

		// 다른 플레이어 기다리던 도중의 연결끊김 핸들링
		socket.onclose = (event) => {
			return Utils.changeFragment('#set_player_num/');
		};

		socket.onerror = function(error) {
			this.setState({ isError: true });
			return Utils.changeFragment('#set_player_num/');
		};

		setSocket(socket);
	}
}
