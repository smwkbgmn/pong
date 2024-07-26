import Component from '../../../core/Component.js'
import * as Event from '../../../core/Event.js'
import * as Utils from '../../../Utils.js'
import * as GameUtils from "../GameUtils.js"

let game = null;

export default class GameMatch extends Component {
	constructor(socket) {
		super();
		
		// 게임중의 이벤트 핸들링
		socket.onmessage = (event) => {
			const data = JSON.parse(event.data);
			
			switch(data.type) {
				case 'match_found':
					this.startGame(data.gameId, data.side, socket);
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

			this.startGame(data.gameId, data.side, socket);
		}

		// 플레이 중에 연결끊김 해들링
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

	setUp() {
		this.$state = {
			countdown: '',
			playerNameLeft: Utils.getParsedItem('player_name'),
			playerNameRight: '',
		};
	}
	
	template() {
		const { playerNameLeft, playerNameRight, countdown } = this.$state;
		const { scoreLeft, scoreRight } = this.$state;

		let result;
		if (this.$props.aiMode == true)
			result = scoreLeft > scoreRight ? '승리' : '패배';
		else
			result = scoreLeft > scoreRight ? playerNameLeft + ' 승리' : playerNameRight + ' 승리';

		let button;
		if (this.$props.lastGame == true)
			button = '다시하기';
		else
			button = '다음 게임';

		return `
			<div class="main-div">
				<p class="main-p">토너먼트</p>

				<p class="score-p">${scoreLeft} : ${scoreRight}</p>
				
				<div class="match-box">
					<p class="match-p">대전 상대</p>
					<p class="next_player_left-p">${playerNameLeft}</p>
					<p class="next_player_vs-p">VS</p>
					<p class="next_player_right-p">${playerNameRight}</p>
					<p class="countdown-p">${countdown}</p>
				</div>
				
				<div class="result-box">
					<p class="result-p">게임 결과</p>
					<p class="win_or_lose-p">${result}</p>
					<button class="restart-btn">${button}</button>
				</div>
			</div>
		`;
	}

	async startGame(gameId, side, socket) {
		for (let i = 3; i > 0; i--) {
			if (window.location.hash != '#game_match/')
				return false;
			this.setState({ countdown: i });
			await GameUtils.sleep(1000);
		}

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