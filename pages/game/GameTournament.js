// 로컬 토너먼트일 때 로컬 게임 객체를 관리 (대진표)
// 홈이나 다른 곳으로 벗어나면 이름 삭제
// 다시하기 누를 경우 이름 유지

import Component from '../../core/Component.js'
import PongGame from '../../components/GameLocal.js'

export default class GameTournament extends Component {
	constructor($target, $props) {
		super($target, $props);
		this.startTournament();
	}

	setUp() {
		this.$state = {
			aiMode: false,
			player_num: sessionStorage.getItem('player_num'),
			players_name: JSON.parse(sessionStorage.getItem('players_name')),
			player1: '',
			player2: '',
			countdown: '',
			lastGame: false,
		};
	}

	template() {
		const { player_num, players_name } = this.$state;

		let inputHTML = '';
		for(let i = 0; i < player_num; i++) {
			inputHTML += `
				<p class="players_name-p name${i + 1}">${players_name[i]}</p>
			`;
		}

		return `
			<link rel="stylesheet" href="./style/Game.css">
			<link rel="stylesheet" href="./style/game/GameTournament.css">
			
			<a class="home-a" href="#/">
				<img class="game-home-img" src="./asset/home-icon.png">
			</a>

			<div class="player_list-box">
				${inputHTML}
			</div>

			<div class="match-box">
				<p class="match-p">대전 상대</p>
				<p class="next_player1-p">${this.$state.player1}</p>
				<p class="next_player_vs-p">VS</p>
				<p class="next_player2-p">${this.$state.player2}</p>
				<p class="countdown-p">${this.$state.countdown}</p>
			</div>

			<div data-component="game-div"></div>
		`;
	}

	mounted() {
		const $game = this.$target.querySelector(
			'[data-component="game-div"]'
		);

		if (sessionStorage.getItem('isLoggedIn') == 'true')
			window.location.href = './#waiting_player/';
	}

	async startTournament() {
		const { player_num } = this.$state;

		for(let i = 0; i < player_num; i += 2) {
			await this.showNextPlayers(i);
			const $game = this.$target.querySelector(
				'[data-component="game-div"]'
			);
			const pongGame = new PongGame($game, this.$state); // 게임이 끝나길 기다려야함
			await this.waitForGameEnd(pongGame);
		}
	}

	async showNextPlayers(idx) {
		const { players_name } = this.$state;

		this.setState({ player1: players_name[idx], player2: players_name[idx + 1] });
		for (let i = 3; i > 0; i--) {
			this.setState({ countdown: i });
			await this.sleep(1000);
		}
		this.setNextPlayersOpacity(0);
	}

	sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	setNextPlayersOpacity(value) {
		const $match = document.querySelector('.match-box');

		console.log($match);
		$match.style.opacity = value;
	}
}
