import Component from '../../../core/Component.js'
import * as GameUtils from "../GameUtils.js"
import * as Utils from '../../../Utils.js'

export default class GameAI extends Component {
	constructor($target, $props) {
		super($target, $props);

		if (this.settingDone == true)
			this.startAIGame();
		else
			Utils.changeFragment('#/');
	}

	setUp() {
		this.$state = {
			countdown: '',

			aiMode: true,
			lastGame: true,

			playerNameLeft: Utils.getParsedItem('playerName'),
			playerNameRight: 'AI',
		}

		this.settingDone = this.$state.playerNameLeft != null;
	}

	template() {
		const { countdown, playerNameLeft, playerNameRight } = this.$state;
		
		if (this.settingDone == false)
			return ``;
		
		const inputHTML = this.makePlayerInfo();
		
		return `
			<a class="game_home-a" href="#/">
				<img class="game_home-img" src="/static/asset/home-icon.png">
			</a>
			
			<p class="countdown_ai-p">${countdown}</p>
			
			<div class="player_left-div">
				${inputHTML}
				<p class="player_name-p">${playerNameLeft}</p>
			</div>
			
			<div class="player_right-div">
				<p class="player_name-p">${playerNameRight}</p>
			</div>

			<div data-component="game-div"></div>
		`;
	}

	makePlayerInfo() {
		const isLoggedIn = Utils.getParsedItem('isLoggedIn');

		let inputHTML = '';
		if (isLoggedIn == true) {
			const playerImage = Utils.getParsedItem('playerImage');

			inputHTML = `<img class="player-img" src="${playerImage}"></img>`;
		}

		return inputHTML;
	}

	async startAIGame() {
		if (await GameUtils.showCountdown.call(this, '#game_ai/', '.countdown_ai-p') == false)
			return ;
			
		this.setPlayerInfoStyle();

		while (window.location.hash == '#game_ai/')
			await GameUtils.playGame(this.$state, this.$target);
	}

	setPlayerInfoStyle() {
		const isLoggedIn = Utils.getParsedItem('isLoggedIn');

		if (isLoggedIn == true) {
			const playerDiv = this.$target.querySelector('.player_left-div');
			playerDiv.style.top = '52%';
		}
	}
}
