import Component from '../../../core/Component.js'
import PongRender from '../../../components/PongRender.js'
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

		// 게임중의 이벤트 핸들링
		this.socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			console.log(data.type);
			
			switch(data.type) {
				case 'match_found':
					this.gameData = data;
					this.startGame();
					break;
				
				case 'player_info':
					if (game) {
						this.opntInfo = game.getReverse() ? data.left : data.right;
						this.setState({ playerNameRight: this.opntInfo.name, playerImageRight: this.opntInfo.image });
						GameUtils.setComponentStyle('opacity', '.match-box', '0');
						// 설정 끝난 후에 게임 시작 되도록 메세지 보내기??
					}
					break;

				case 'game_update':
					if (game) game.updateGameObjects(data);
					break;
				
				case 'score_change':
					if (game) {
						if (game.getReverse())
							this.setState({ scoreLeft: data.score.right, scoreRight: data.score.left })
						else
							this.setState({ scoreLeft: data.score.left, scoreRight: data.score.right })
						GameUtils.setComponentStyle('opacity', '.match-box', '0');
					}
					break;

				case 'game_finish':
					game.cleanUp();
					game = null;
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

				GameUtils.setComponentStyle('opacity', '.result-box', '100');
				GameUtils.setComponentStyle('opacity', '.match-box', '0');
			}
		};

		this.socket.onerror = function(error) {
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
			<p class="score-p">${scoreLeft} : ${scoreRight}</p>

			<div class="match-box">
				<p class="match-p">대전 상대</p>
				<p class="next_player_left-p">${this.playerNameLeft}</p>
				<p class="next_player_vs-p">VS</p>
				<p class="next_player_right-p">${playerNameRight}</p>
				<p class="countdown-p">${countdown}</p>
			</div>
			
			<div class="result-box">
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
		this.clickedRestartButtonWrapped = Event.addEvent(this.$target, 'click', '.restart-btn', this.clickedRestartButton.bind(this));
	}

	clearEvent() {
		Event.removeEvent('click', this.clickedRestartButtonWrapped);
	}

	clickedRestartButton() {
		this.setState({ lastGame: false });
		// 새로 게임에 참가 -> game_matchmaking으로?
	}


	async startGame() {
		GameUtils.setComponentStyle('opacity', '.result-box', '0');
		GameUtils.setComponentStyle('opacity', '.match-box', '100');

		for (let i = 3; i > 0; i--) {
			if (window.location.hash != '#game_match/')
				return false;
			this.setState({ countdown: i });
			await GameUtils.sleep(1000);
		}

		// GameUtils.setComponentStyle('opacity', '.match-box', '0');

		game = new PongRender(this.gameData.gameId, this.gameData.side, this.socket);
	}

	roundNext(data) {
		if (data.type != 'round_wait')
			this.setState({ lastGame: true });
		GameUtils.setComponentStyle('opacity', '.match-box', '0');
		GameUtils.setComponentStyle('opacity', '.result-box', '100');

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