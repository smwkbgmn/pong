import Component from '../../core/Component.js'
import * as GameUtils from "./GameUtils.js"

export default class GameTournament extends Component {
	constructor($target, $props) {
		super($target, $props);

		if (sessionStorage.getItem('isLoggedIn') == 'true')
			window.location.href = './#waiting_player/';
		else
			this.startTournamentGame();
	}

	setUp() {
		this.$state = {
			aiMode: false,

			player_num: sessionStorage.getItem('player_num'),

			players_name: JSON.parse(sessionStorage.getItem('players_name')),
			active_players_name: JSON.parse(sessionStorage.getItem('players_name')),
			lose_players_name: [],

			player_name1: '',
			player_name2: '',

			countdown: '',
			lastGame: false,
		};

		// this.checkSetting();
	}

	template() {
		const { player_name1, player_name2, countdown } = this.$state;
		const inputHTML = this.makePlayerList();

		return `
			<link rel="stylesheet" href="/static/style/Game.css">
			<link rel="stylesheet" href="/static/style/game/GameTournament.css">
			
			<a class="home-a" href="#/">
				<img class="game-home-img" src="/static/asset/home-icon.png">
			</a>

			<div class="player_list-box">
				${inputHTML}
			</div>

			<div class="match-box">
				<p class="match-p">대전 상대</p>
				<p class="next_player_name1-p">${player_name1}</p>
				<p class="next_player_vs-p">VS</p>
				<p class="next_player_name2-p">${player_name2}</p>
				<p class="countdown-p">${countdown}</p>
			</div>

			<div class="player-div1">
				<p class="player_name-p">${player_name1}</p>
			</div>

			<div class="player-div2">
				<p class="player_name-p">${player_name2}</p>
			</div>

			<div data-component="game-div"></div>
		`;
	}

	// checkSetting() {
	// 	if (this.$state.player_num == undefined)
	// 		window.location.href = './#';
	// }
	
	makePlayerList() {
		const { player_num, players_name, lose_players_name } = this.$state;
		let inputHTML = '';

		for(let i = 0; i < player_num; i++) {
			let color;

			if (lose_players_name.find(player => player == players_name[i]))
				color = 'darkgray';
			else
				color = 'white';

			inputHTML += `
				<p class="players_name-p name${i + 1}" style="color: ${color};">${players_name[i]}</p>
			`;
		}

		return inputHTML;
	}

	async startTournamentGame() {
		let active_player_num = this.$state.player_num;

		while (window.location.hash == '#game_tournament/') {
			let win_players_name = [];

			for(let i = 0; i < active_player_num; i += 2) {
				await this.showNextPlayers(i);

				if (active_player_num == 2)
					this.$state.lastGame = true;

				const winnerName = await GameUtils.playGame(this.$state, this.$target);
				
				win_players_name.push(winnerName);
				this.$state.lose_players_name.push(this.getLoserName(winnerName));

				this.render();
			}
			
			active_player_num = this.setLoopCondition(active_player_num, win_players_name);
		}
	}

	async showNextPlayers(idx) {
		const { active_players_name } = this.$state;

		this.setState({ player_name1: active_players_name[idx], player_name2: active_players_name[idx + 1] });
		for (let i = 3; i > 0; i--) {
			this.setState({ countdown: i });
			await GameUtils.sleep(1000);
		}
		GameUtils.setComponentOpacity('.match-box', 0);
	}

	getLoserName(winnerName) {
		return winnerName == this.$state.player_name1 ? this.$state.player_name2 : this.$state.player_name1;
	}

	setLoopCondition(active_player_num, win_players_name) {
		if (this.$state.lastGame == true)
			return this.resetTournament();
		return this.setNextGame(active_player_num, win_players_name);
	}

	resetTournament() {
		this.$state.active_players_name = this.$state.players_name;
		this.$state.lastGame = false;
		this.$state.lose_players_name = [];
		return this.$state.player_num;
	}
	
	setNextGame(active_player_num, win_players_name) {
		this.$state.active_players_name = win_players_name;
		return active_player_num / 2;
	}
}
