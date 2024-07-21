import Component from '../../core/Component.js'
import * as GameUtils from "./GameUtils.js"
import * as Utils from '../../Utils.js'

export default class GameAI extends Component {
	constructor($target, $props) {
		super($target, $props);

		const { settingDone } = this.$state;

		if (settingDone == true)
			this.startAIGame();
		else
			Utils.changeFragment('#/');
	}

	setUp() {
		this.$state = {
			aiMode: true,

			playerName: Utils.getParsedItem('playerName'),

			countdown: '',
			lastGame: true,

			settingDone: false,
		}

		this.$state.settingDone = this.$state.playerName != null;
	}

	template() {
		const { settingDone, playerName } = this.$state;
		
		if (settingDone == false)
			return ``;
		
		const inputHTML = this.makePlayerInfo();
		
		return `
			<a class="home-a" href="#/">
			<img class="game_home-img" src="/static/asset/home-icon.png">
			</a>
			
			<p class="countdown-p">${this.$state.countdown}</p>
			
			<div class="player-div">
				${inputHTML}
				<p class="playerName-p">${playerName}</p>
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
		await this.showCountdown();
		this.setPlayerInfoStyle();

		while (window.location.hash == '#game_ai/')
			await GameUtils.playGame(this.$state, this.$target);
	}

	async showCountdown() {
		for (let i = 3; i > 0; i--) {
			this.setState({ countdown: i });
			await GameUtils.sleep(1000);
		}
		
		GameUtils.setComponentOpacity('.countdown-p', 0);
	}

	setPlayerInfoStyle() {
		const isLoggedIn = Utils.getParsedItem('isLoggedIn');

		if (isLoggedIn == true) {
			const playerDiv = this.$target.querySelector('.player-div');
			playerDiv.style.top = '52%';
		}
	}
}
