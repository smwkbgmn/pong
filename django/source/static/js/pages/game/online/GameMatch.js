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

		if (this.settingDone == false) {
			Utils.setStringifiedItem('gameStart', false);
			Utils.changeFragment('#set_player_num/');
		}
		else {
			Utils.setStringifiedItem('gameStart', true);
	
			this.setState({ playerNameRight: this.gameData.opnt_name, playerImageRight: this.gameData.opnt_image });
	
			this.socket.onmessage = (event) => {
				const data = JSON.parse(event.data);
				
				switch(data.type) {
					case 'match_found':
						console.log(data.players);
						
						this.gameData = data;
						const tmpPlayerNames = this.gameData.players.map(player => player.name);
						console.log(tmpPlayerNames);
						this.setState({ playerNameRight: data.opnt_name, playerImageRight: data.opnt_image, 
										winnerPlayerNames: tmpPlayerNames, scoreLeft: 0, scoreRight: 0 });
						this.startGame();
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
							GameUtils.setComponentStyle('opacity', '.match-div', '0');
						}
						break;
	
					case 'game_finish':
						console.log('gamefinish');
						this.clearGame();
						this.setState({ walkover: data.walkover });
						break;
	
					case 'round_wait':
					case 'round_end':
					case 'tournament_win':
						console.log('end');
						this.roundNext(data);
						break;
				}
			}

			this.socket.onclose = (event) => {
				console.log('onclose');
				this.clearGame();
				// this.closeSocket();
				this.clearSocket();
			};
	
			this.socket.onerror = function(error) {
				this.clearGame();
				// this.closeSocket();
				this.clearSocket();
	
				this.setState({ isError: true });
				Utils.changeFragment('#/');
			};
	
			this.startGame();
		}
	}

	setUp() {
		this.$state = {
			countdown: '',
			lastGame: false,

			playerNameRight: '',
			playerImageRight: '',

			winnerPlayerNames: null,

			scoreLeft: 0,
			scoreRight: 0,

			isWinner: false,
			walkover: false,
			isError: false,
		};

		this.socket = getSocket();
		this.gameData = Utils.getParsedItem('gameData');

		this.settingDone = (this.socket && this.gameData && Utils.getParsedItem('gameStart') == false) == true ? true : false;
		if (this.settingDone == false)
			return ;

		this.playerNameLeft = Utils.getParsedItem('playerName');
		this.playerImageLeft = Utils.getParsedItem('playerImage');

		this.playerNames = this.gameData.players.map(player => player.name);
		this.$state.winnerPlayerNames = this.playerNames;
		this.playerNum = Utils.getParsedItem('playerNum');

		this.reverse = false;
	}
	
	unmounted() {
		console.log('unmounted');
		Utils.setStringifiedItem('gameStart', false);

		// this.clearGame();
		if (this.socket) {
			this.closeSocket();
			this.clearSocket();
		}
		
		this.clearEvent();
	}

	template() {
		const { playerImageRight, playerNameRight,
				countdown, lastGame, walkover, isError, isWinner,
				scoreLeft, scoreRight } = this.$state;

		if (this.settingDone == false)
			return ``;
		
		const inputHTML = this.makePlayerList();

		let result;
		if (isError == true)
			result = '서버에 연결할 수 없습니다.';
		else if (walkover == true)
			result = this.playerNameLeft + ' 승리';
		else
			result = scoreLeft > scoreRight ? this.playerNameLeft + ' 승리' : playerNameRight + ' 승리';

		let button;
		if (isError == true)
			button = '';
		else if (lastGame == true)
			button = '다시하기';
		else
			button = '다른 게임 기다리는 중...';

		let message = '';
		if (walkover == true)
			message = '상대방이 게임에서 퇴장하였습니다.';
		else if (isWinner == true)
			message = '토너먼트에서 승리했습니다.';

		console.log('winner' + isWinner);

		return `
			<a class="game_home-a" href="#/">
				<img class="game_home-img" src="/static/asset/home-icon.png">
			</a>

			<p class="score-p">${scoreLeft} : ${scoreRight}</p>

			<div class="player_list-div">
				${inputHTML}
			</div>

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
				<p class="walkover-p">${message}</p>
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

	makePlayerList() {
		let inputHTML = '';

		for(let i = 0; i < this.playerNum; i++) {
			let color;

			if (this.$state.winnerPlayerNames.find(player => player == this.playerNames[i]))
				color = 'white';
			else
				color = 'darkgray';

			inputHTML += `
				<p class="players_name-p name${i + 1}" style="color: ${color};">${this.playerNames[i]}</p>
			`;
		}

		return inputHTML;
	}

	clearGame() {
		if (game) {
			game.cleanUp();
			game = null;
		}
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

	async startGame() {
		if (this.$state.isError == true ||
			await GameUtils.showCountdown.call(this, '#game_match/', '.match-div') == false)
			return ;

		game = new PongClient(this.gameData.game_id, this.gameData.side, this.socket);
	}

	roundNext(data) {
		console.log('round next');
		if (data.type != 'round_wait')
			this.setState({ lastGame: true });
		GameUtils.setComponentStyle('display', '.result-div', 'block');

		if (data.type == "round_wait") this.roundWait();
		else {
			if (data.type == "round_end") this.roundEnd();
			else this.tournamentWin();

			this.clearSocket();
		}
	}

	roundWait() {
		console.log("receive round_wait from server");
	}

	roundEnd() {
		console.log("receive round_end from server");
	}

	tournamentWin() {
		console.log("receive tournament_win from server");
		this.setState({ isWinner: true });
		GameUtils.setComponentStyle('display', '.result-div', 'block');
	}
}