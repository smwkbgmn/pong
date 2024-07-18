import Component from '../../core/Component.js'
import * as GameUtils from "./GameUtils.js"

export default class GameAI extends Component {
	constructor($target, $props) {
		super($target, $props);

		this.startAIGame();
	}

	setUp() {
		this.$state = {
			aiMode: true,
			countdown: '',
			lastGame: true,
		}
	}

	template() {
		const inputHTML = this.makePlayerInfo();
		const player_name = JSON.parse(sessionStorage.getItem('player_name'));

		return `
			<link rel="stylesheet" href="/static/style/Game.css">
			<link rel="stylesheet" href="/static/style/game/GameAI.css">
			
			<a class="home-a" href="#/">
			<img class="game-home-img" src="/static/asset/home-icon.png">
			</a>
			
			<p class="countdown-p">${this.$state.countdown}</p>
			
			<div class="player-div">
				${inputHTML}
				<p class="player_name-p">${player_name}</p>
			</div>
			
			<div data-component="game-div"></div>
		`;
	}

	makePlayerInfo() {
		const isLoggedIn = sessionStorage.getItem('isLoggedIn');

		let inputHTML = '';
		if (isLoggedIn == 'true') {
			const player_img = JSON.parse(sessionStorage.getItem('player_image'));
			inputHTML = `<img class="player-img" src="${player_img}"></img>`;
		}

		return inputHTML;
	}

	async startAIGame() {
		await this.showCountdown();
		this.setPlayerInfoStyle();
		while (window.location.hash == '#game_ai/') {
			await GameUtils.playGame(this.$state, this.$target);
		}
	}

	async showCountdown() {
		for (let i = 3; i > 0; i--) {
			this.setState({ countdown: i });
			await GameUtils.sleep(1000);
		}
		GameUtils.setComponentOpacity('.countdown-p', 0);
	}

	setPlayerInfoStyle() {
		const isLoggedIn = sessionStorage.getItem('isLoggedIn');

		if (isLoggedIn == 'true') {
			const playerDiv = this.$target.querySelector('.player-div');
			playerDiv.style.top = '52%';
		}
	}
}
