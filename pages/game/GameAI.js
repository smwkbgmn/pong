import Component from '../../core/Component.js'
import PongGame from '../../components/GameLocal.js'

export default class GameAI extends Component {
	setUp() {
		this.$state = {
			aiMode: true,
		}
	}

	template() {
		return `
			<link rel="stylesheet" href="./style/Game.css">
			<link rel="stylesheet" href="./style/game/GameAI.css">
			
			<div data-component="game-div"></div>

			<a class="home-a" href="#/">
				<img class="game-home-img" src="./asset/home-icon.png">
			</a>
		`;
	}

	mounted() {
		const $game = this.$target.querySelector(
			'[data-component="game-div"]'
		);
		new PongGame($game, this.$state);
	}
}
