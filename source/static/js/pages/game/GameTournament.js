import Component from '../../core/Component.js'
import * as GameUtils from "./GameUtils.js"

export default class GameTournament extends Component {
	constructor($target, $props) {
		super($target, $props);

		const { settingDone } = this.$state;

		if (settingDone == true) {
			if (sessionStorage.getItem('isLoggedIn') == 'true')
				window.location.href = './#waiting_player/';
			else
				this.startTournamentGame();
		}
		else
			window.location.href = './#/';
	}

	setUp() {
		this.$state = {
			aiMode: false,

			playerNum: sessionStorage.getItem('playerNum'),

			playerNames: JSON.parse(sessionStorage.getItem('playerNames')),
			activePlayerNames: JSON.parse(sessionStorage.getItem('playerNames')),
			losePlayerNames: [],

			playerNameLeft: '',
			playerNameRight: '',

			countdown: '',
			lastGame: false,

			settingDone: false,
		};
		
		this.$state.settingDone = this.$state.playerNames != null;
	}

	template() {
		const { settingDone, playerNameLeft, playerNameRight, countdown } = this.$state;
		
		if (settingDone == false)
			return ``;
		
		const inputHTML = this.makePlayerList();

		return `
			<a class="home-a" href="#/">
				<img class="game_home-img" src="/static/asset/home-icon.png">
			</a>

			<div class="player_list-box">
				${inputHTML}
			</div>

			<div class="match-box">
				<p class="match-p">대전 상대</p>
				<p class="next_player_left-p">${playerNameLeft}</p>
				<p class="next_player_vs-p">VS</p>
				<p class="next_player_right-p">${playerNameRight}</p>
				<p class="countdown-p">${countdown}</p>
			</div>

			<div class="player_left-div">
				<p class="player_name-p">${playerNameLeft}</p>
			</div>

			<div class="player_right-div">
				<p class="player_name-p">${playerNameRight}</p>
			</div>

			<div data-component="game-div"></div>
		`;
	}
	
	makePlayerList() {
		const { playerNum, playerNames, losePlayerNames } = this.$state;
		let inputHTML = '';

		for(let i = 0; i < playerNum; i++) {
			let color;

			if (losePlayerNames.find(player => player == playerNames[i]))
				color = 'darkgray';
			else
				color = 'white';

			inputHTML += `
				<p class="playerNames-p name${i + 1}" style="color: ${color};">${playerNames[i]}</p>
			`;
		}

		return inputHTML;
	}

	async startTournamentGame() {
		let active_playerNum = this.$state.playerNum;

		while (window.location.hash == '#game_tournament/') {
			let winPlayerNames = [];

			for(let i = 0; i < active_playerNum; i += 2) {
				await this.showNextPlayers(i);

				if (active_playerNum == 2)
					this.$state.lastGame = true;

				const winnerName = await GameUtils.playGame(this.$state, this.$target);
				
				winPlayerNames.push(winnerName);
				this.$state.losePlayerNames.push(this.getLoserName(winnerName));

				this.render();
			}
			
			active_playerNum = this.setLoopCondition(active_playerNum, winPlayerNames);
		}
	}

	async showNextPlayers(idx) {
		const { activePlayerNames } = this.$state;

		this.setState({ playerNameLeft: activePlayerNames[idx], playerNameRight: activePlayerNames[idx + 1] });
		for (let i = 3; i > 0; i--) {
			this.setState({ countdown: i });
			await GameUtils.sleep(1000);
		}
		GameUtils.setComponentOpacity('.match-box', 0);
	}

	getLoserName(winnerName) {
		return winnerName == this.$state.playerNameLeft ? this.$state.playerNameRight : this.$state.playerNameLeft;
	}

	setLoopCondition(active_playerNum, winPlayerNames) {
		if (this.$state.lastGame == true)
			return this.resetTournament();
		return this.setNextGame(active_playerNum, winPlayerNames);
	}

	resetTournament() {
		this.$state.activePlayerNames = this.$state.playerNames;
		this.$state.lastGame = false;
		this.$state.losePlayerNames = [];
		return this.$state.playerNum;
	}
	
	setNextGame(active_playerNum, winPlayerNames) {
		this.$state.activePlayerNames = winPlayerNames;
		return active_playerNum / 2;
	}
}
