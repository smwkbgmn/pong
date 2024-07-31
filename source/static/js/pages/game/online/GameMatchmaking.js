import Component from '../../../core/Component.js'
import PongRender from "../../../components/PongRender.js";
import * as Event from '../../../core/Event.js'
import * as Utils from '../../../Utils.js'
import * as GameUtils from "../GameUtils.js"

import { setSocket } from './SharedSocket.js';

// let socket = null;
export default class GameMatchmaking extends Component {
	constructor($target, $props) {
		super($target, $props);

		this.setupSocket();
	}

	setUp() {
		this.$state = {
			idx: 2,
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
		const { idx } = this.$state;

		return `			
			<div class="main-div">
				<p class="main-p">토너먼트</p>
				
				<a class="home-a" href="#/">
					<img class="home-img" src="/static/asset/home-icon.png">
				</a>
			
				<p class="message-p">${this.textList[idx]}</p>
				
				<a class="exit-a" href="#set_player_num/">돌아가기</a>

				<div class="matchmaking-container"></div>
				<div class="game-container"></div>
			</div>
		`;
	}

	setEvent() {
		this.clearTimeoutWrapped = Event.addHashChangeEvent(clearTimeout.bind(this, this.timer));
	}

	clearEvent() {
		Event.removeHashChangeEvent(this.clearTimeoutWrapped);
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
		console.log(socket);

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
			console.log(data.type);

			switch(data.type) {
				case 'waiting_for_players':
					break;

				case 'match_found':
					this.gameStart = true;
					Utils.setStringifiedItem('gameData', data);
					Utils.changeFragment('#game_match/');
					break;
			}
		};

		// 다른 플레이어 기다리던 도중의 연결끊김 핸들링
		socket.onclose = (event) => {
		};

		socket.onerror = function(error) {
		};

		setSocket(socket);
	}
}
