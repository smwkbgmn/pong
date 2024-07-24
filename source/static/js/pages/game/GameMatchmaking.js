import Component from '../../core/Component.js'
import PongRender from "../../components/PongRender.js";
import * as Utils from '../../Utils.js'
import * as GameUtils from "./GameUtils.js"
import { TorusKnotGeometry } from 'three/src/Three.js';

let game = null;
let socket = null;

export default class GameMatchmaking extends Component {
	constructor($target, $props) {
		super($target, $props);

		this.setSocket();
	}

	setUp() {
		this.$state = {
			playerNum: Utils.getParsedItem('playerNum'),

			idx: 2,
			textList: [
				'다른 참가자를 기다리는 중입니다.',
				'다른 참가자를 기다리는 중입니다..',
				'다른 참가자를 기다리는 중입니다...'
			],
			start: new Date().getSeconds(),
			timer: 0,
		};

		this.changeMessage(this.$state.idx);
	}


	template() {
		const { idx, textList } = this.$state;

		return `			
			<div class="main-div">
				<p class="main-p">토너먼트</p>

				<p class="message-p">${textList[idx]}</p>
				
				<a class="exit-a" href="#set_player_num/">돌아가기</a>

				<div class="matchmaking-container"></div>
				<div class="game-container"></div>
			</div>
		`;
	}

	setEvent() {
		window.addEventListener('hashchange', () => 
			clearTimeout(this.$state.timer));
	}

	changeMessage(prev) {
		const { start } = this.$state;
		
		if (new Date().getSeconds() - start < 3) {
			this.setState({ idx: (prev + 1) % 3 });
			this.$state.timer = setTimeout(this.changeMessage.bind(this, this.$state.idx), 800);
		}
	}

	setSocket() {
		const { playerNum } = this.$state;
		socket = new WebSocket('ws://' + window.location.host + '/ws/pong');

		socket.onopen = (event) => {
			socket.send(JSON.stringify({
				type				: 'requestMatch',
				tournamentSize		: playerNum,
				userTokenAccess		: Utils.getParsedItem('accessToken'),
				userTokenRefresh	: Utils.getParsedItem('refreshToken')
			}));
		};

		socket.onmessage = (event) => {
			const data = JSON.parse(event.data);

			switch(data.type) {
				case 'match_found':
					this.startGame(data.gameId, data.side, socket);
					break;

				case 'waiting_for_players':
					break;

				case 'game_update':
					if (game) game.updateGameObjects(data);
					break;

				case 'game_finish':
					game.cleanUp();
					game = null;
					break;

				case 'round_wait':
				case 'round_end':
				case 'tournament_win':
					this.roundNext(statusDiv, data);
					break;
			}
		};

		socket.onclose = (event) => {
			if (game) {
				game.cleanUp();
				game = null;

				GameUtils.setComponentStyle('display', '.matchmaking-container', 'block');
				GameUtils.setComponentStyle('display', '.game-container', 'none');

				statusDiv.textContent = 'Disconnected from server. Please refresh the page to reconnect.';
			}
		};

		socket.onerror = function(error) {
			statusDiv.textContent = 'Error connecting to the server. Please try again later.';
			console.error('WebSocket Error:', error);
		};
	}

	startGame(gameId, side, socket) {
		GameUtils.setComponentStyle('display', '.matchmaking-container', 'none');
		GameUtils.setComponentStyle('display', '.game-container', 'block');

		game = new PongRender(gameId, side, socket);
	}

	roundNext(statusDiv, data) {
		GameUtils.setComponentStyle('display', '.matchmaking-container', 'block');
		GameUtils.setComponentStyle('display', '.game-container', 'none');

		if (data.type == "round_wait") this.roundWait(statusDiv);
		else if (data.type == "round_end") this.roundEnd(statusDiv);
		else this.tournamentWin(statusDiv);
	}

	roundWait(statusDiv) {
		console.log("receive round_wait from server");
		statusDiv.textContent = `Waiting for other players to finish the game`;
	}

	roundEnd(statusDiv) {
		console.log("receive round_end from server");
		statusDiv.textContent = `Your game has done.\nHave you enjoyed?`;

		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.close();
			socket = null;
		}
	}

	tournamentWin(statusDiv) {
		console.log("receive tournament_win from server");
		statusDiv.textContent = `CONGRATULATION!!\nYOU ARE THE WINNER!!`;
	}
}
