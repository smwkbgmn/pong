import Component from '../../../core/Component.js'
import * as Utils from '../../../Utils.js'
import * as GameUtils from "../GameUtils.js"

export default class GameTournament extends Component {
	constructor($target, $props) {
		super($target, $props);

		if (this.settingDone == true) {
			if (Utils.getParsedItem('isLoggedIn') == true)
				Utils.changeFragment('#waiting_player/');
			else
				this.startTournamentGame();
		}
		else
			Utils.changeFragment('#/');
	}

	setUp() {
		this.$state = {
			countdown: '',
			
			aiMode: false,
			lastGame: false,

			playerNameLeft: '',
			playerNameRight: '',
		};
		
		this.playerNames = Utils.getParsedItem('playerNames');
		this.playerNum = Utils.getParsedItem('playerNum');
		this.settingDone = this.playerNames != null;
		
		this.activePlayerNames = Utils.getParsedItem('playerNames');
		this.losePlayerNames = [];
	}

	template() {
		const { playerNameLeft, playerNameRight, countdown } = this.$state;
		
		if (this.settingDone == false)
			return ``;
		
		const inputHTML = this.makePlayerList();

		return `
			<a class="game_home-a" href="#/">
				<img class="game_home-img" src="/static/asset/home-icon.png">
			</a>

			<div class="player_list-div">
				${inputHTML}
			</div>

			<div class="match-div">
				<p class="match-p">대전 상대</p>
				<p class="next_player_left-p">${playerNameLeft}</p>
				<p class="next_player_vs-p">VS</p>
				<p class="next_player_right-p">${playerNameRight}</p>
				<p class="countdown_tourn-p">${countdown}</p>
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
		let inputHTML = '';

		for(let i = 0; i < this.playerNum; i++) {
			let color;

			if (this.losePlayerNames.find(player => player == this.playerNames[i]))
				color = 'darkgray';
			else
				color = 'white';

			inputHTML += `
				<p class="players_name-p name${i + 1}" style="color: ${color};">${this.playerNames[i]}</p>
			`;
		}

		return inputHTML;
	}

	async startTournamentGame() {
		let activePlayerNum = this.playerNum;

		while (window.location.hash == '#game_tournament/') {
			let winPlayerNames = [];
			
			for(let i = 0; i < activePlayerNum; i += 2) {
				if (await this.showNextPlayers(i) == false)
					return ;

				if (activePlayerNum == 2)
					this.$state.lastGame = true;

				const winnerName = await GameUtils.playGame(this.$state, this.$target);

				console.log('winner is: ' + winnerName);

				winPlayerNames.push(winnerName);
				this.losePlayerNames.push(this.getLoserName(winnerName));

				this.render();
			}
			
			activePlayerNum = this.setLoopCondition(activePlayerNum, winPlayerNames);

		}
	}

	async showNextPlayers(idx) {
		this.setState({ playerNameLeft: this.activePlayerNames[idx], playerNameRight: this.activePlayerNames[idx + 1] });
		GameUtils.setComponentStyle('display', '.match-div', 'block');

		return await GameUtils.showCountdown.call(this, '#game_tournament/', '.match-div');
	}

	getLoserName(winnerName) {
		return winnerName == this.$state.playerNameLeft ? this.$state.playerNameRight : this.$state.playerNameLeft;
	}

	setLoopCondition(activePlayerNum, winPlayerNames) {
		if (this.$state.lastGame == true)
			return this.resetTournament();
		return this.setNextGame(activePlayerNum, winPlayerNames);
	}

	resetTournament() {
		this.activePlayerNames = this.playerNames;
		this.losePlayerNames = [];
		this.$state.lastGame = false;
		return this.playerNum;
	}
	
	setNextGame(activePlayerNum, winPlayerNames) {
		this.activePlayerNames = winPlayerNames;
		return activePlayerNum / 2;
	}
}
