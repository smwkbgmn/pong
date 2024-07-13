import Component from '../../core/Component.js'
import PongGame from '../../components/GameLocal.js'

export default class GameAI extends Component {
	setUp() {
		this.$state = {
			aiMode: true,
		}
	}

	template() {
		const isLoggedIn = sessionStorage.getItem('isLoggedIn');

		// 이미지 잘 불러와지는지 확인하기
		let inputHTML = '';
		if (isLoggedIn == true) {
			const player_img = JSON.parse(sessionStorage.getItem('player_img'));
			inputHTML = '<img class="player-img" src="player_img"></img>';
		}

		// 저장된 이름이 없으면 setNameAI로 리다이렉트?
		const player_name = JSON.parse(sessionStorage.getItem('player_name'));

		return `
			<link rel="stylesheet" href="./style/Game.css">
			<link rel="stylesheet" href="./style/game/GameAI.css">
			
			<div data-component="game-div"></div>

			<a class="home-a" href="#/">
				<img class="game-home-img" src="./asset/home-icon.png">
			</a>

			<div class="player-div">
				${inputHTML}
				<p class="player_name">${player_name}</p>
			</div>
		`;
	}

	mounted() {
		const $game = this.$target.querySelector(
			'[data-component="game-div"]'
		);
		new PongGame($game, this.$state);
	}
}
