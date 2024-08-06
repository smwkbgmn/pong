import Component from '../../../core/Component.js'
import PongClient from '../../../components/PongClient.js'
import * as Event from '../../../core/Event.js'
import * as Utils from '../../../Utils.js'
import * as GameUtils from "../GameUtils.js"

import { setSocket, getSocket } from './SharedSocket.js';

let game = null;
export default class GameMatch extends Component {
	constructor($target) {
		super($target);
		
		this.socket = getSocket();
		console.log(this.socket);
		
		if (!this.socket) {
            console.error('WebSocket not initialized');
            return;
        }

		this.setState({ playerNameRight: this.gameData.opnt_name, playerImageRight: this.gameData.opnt_image });

		// 게임중의 이벤트 핸들링
		this.socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			// console.log("in match");
			// console.log(data);
			
			switch(data.type) {
				case 'match_found':
					//data.players
					/*
					players {
						player1: {
							channel: ----
							name: eunwole
							image: image_uri
						},
						player2: ...
					}
					*/
					this.gameData = data;
					this.setState({ playerNameRight: data.opnt_name, playerImageRight: data.opnt_image });
					this.startGame();
					break;
				
				// case 'player_info':
				// 	if (game) {
				// 		this.opntInfo = game.getReverse() ? data.left : data.right;
				// 		this.setState({ playerNameRight: this.opntInfo.name, playerImageRight: this.opntInfo.image });
				// 		GameUtils.setComponentStyle('opacity', '.match-div', '0');
				// 	}
				// 	break;

				case 'game_update':
					if (game) game.updateGameObjects(data);
					break;
				
				case 'score_change':
					if (game) {
						if (game.getReverse())
							this.setState({ scoreLeft: data.score.right, scoreRight: data.score.left })
						else
							this.setState({ scoreLeft: data.score.left, scoreRight: data.score.right })
						GameUtils.setComponentStyle('opacity', '.match-div', '0');
					}
					break;

				case 'game_finish':
					if (game) {
						game.cleanUp();
						game = null;
					}
					if (data.walkover == 'True') {
						// 상대방 탈주 핸들링 
					}
					break;

				case 'round_wait':
				case 'round_end':
				case 'tournament_win':
					this.roundNext(data);
					break;
			}
		
			// this.startGame(data.gameId, data.side, socket);
	}

		// 플레이 중에 연결끊김 해들링
		this.socket.onclose = (event) => {
			if (game) {
				console.log('disconnection');
				game.cleanUp();
				game = null;

				setSocket(null);
				this.socket = null;

				// 연결 끊김 (서버에 연결할 수 없습니다)
				GameUtils.setComponentStyle('opacity', '.result-div', '100');
				GameUtils.setComponentStyle('opacity', '.match-div', '0');

				Utils.changeFragment('#set_player_num/');
			}
		};

		this.socket.onerror = function(error) {
			// game.cleanUp(); ??

			// 연결 끊김 (서버에 연결할 수 없습니다)
			Utils.changeFragment('#set_player_num/');
			console.error('WebSocket Error:', error);
		};

		this.startGame();
	}

	setUp() {
		this.$state = {
			countdown: '',
			lastGame: false,

			playerNameRight: '',
			playerImageRight: '',
			
			scoreLeft: 0,
			scoreRight: 0,
		};

		this.playerNameLeft = Utils.getParsedItem('playerName');
		this.playerImageLeft = Utils.getParsedItem('playerImage');

		this.reverse = false;

		this.gameData = Utils.getParsedItem('gameData');
	}
	
	template() {
		const { playerImageRight, playerNameRight,
				countdown, lastGame,
				scoreLeft, scoreRight } = this.$state;

		const result = scoreLeft > scoreRight ? this.playerNameLeft + ' 승리' : playerNameRight + ' 승리';

		let button;
		if (lastGame == true)
			button = '다시하기';
		else
			button = '다음 게임';

		return `
			<a class="game_home-a" href="#/">
				<img class="game_home-img" src="/static/asset/home-icon.png">
			</a>

			<p class="score-p">${scoreLeft} : ${scoreRight}</p>

			<div class="match-div">
				<p class="match-p">대전 상대</p>
				<p class="next_player_left-p">${this.playerNameLeft}</p>
				<p class="next_player_vs-p">VS</p>
				<p class="next_player_right-p">${playerNameRight}</p>
				<p class="countdown_tourn-p">${countdown}</p>
			</div>
			
			<div class="result-div">
				<p class="result-p">게임 결과</p>
				<p class="win_or_lose-p">${result}</p>
				<button class="restart-btn">${button}</button>
			</div>			

			<div class="player_left-div">
				<img class="player-img" src="${this.playerImageLeft}"></img>
				<p class="player_name-p">${this.playerNameLeft}</p>
			</div>

			<div class="player_right-div">
				<img class="player-img" src="${playerImageRight}"></img>
				<p class="player_name-p">${playerNameRight}</p>
			</div>
		`;
	}

	setEvent() {
		this.unmountedBinded = Event.addHashChangeEvent(this.unmounted.bind(this));
		this.clickedRestartButtonWrapped = Event.addEvent(this.$target, 'click', '.restart-btn', this.clickedRestartButton.bind(this));
	}

	clearEvent() {
		Event.removeHashChangeEvent(this.unmountedBinded);
		Event.removeEvent(this.$target, 'click', this.clickedRestartButtonWrapped);
	}

	clickedRestartButton() {
		Utils.changeFragment("#game_matchmaking/");
	}

	async startGame() {
		if (await GameUtils.showCountdown.call(this, '#game_match/', '.match-div') == false)
			return ;

		game = new PongClient(this.gameData.game_id, this.gameData.side, this.socket);
	}

	roundNext(data) {
		if (data.type != 'round_wait')
			this.setState({ lastGame: true });
		GameUtils.setComponentStyle('display', '.result-div', 'block');

		if (data.type == "round_wait") this.roundWait();
		else {
			if (data.type == "round_end") this.roundEnd();
			else this.tournamentWin();

			if (this.socket && this.socket.readyState === WebSocket.OPEN) {
				this.socket.close();
				this.socket = null;
			}
		}
	}

	roundWait() {
		console.log("receive round_wait from server");
		// statusDiv.textContent = `Waiting for other players to finish the game`;
	}

	roundEnd() {
		console.log("receive round_end from server");
		// statusDiv.textContent = `Your game has done.\nHave you enjoyed?`;
	}

	tournamentWin() {
		console.log("receive tournament_win from server");
		// statusDiv.textContent = `CONGRATULATION!!\nYOU ARE THE WINNER!!`;
	}
}