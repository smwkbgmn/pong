// 로컬 토너먼트일 때 로컬 게임 객체를 관리 (대진표)

import Component from '../../core/Component.js'
import PongGame from '../../components/GameLocal.js'
// import { temp } from 'three/examples/jsm/nodes/Nodes.js';

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
			active_players_name: JSON.parse(sessionStorage.getItem('players_name')),
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
			let color;
			if (this.$state.active_players_name.find(player => player == players_name[i]))
				color = 'white';
			else
				color = 'darkgray';

			inputHTML += `
				<p class="players_name-p name${i + 1}" style="color: ${color};">${players_name[i]}</p>
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
		let active_player_num = this.$state.player_num;

		// 무한루프로 해도 되나? 조건 다시 생각해보기
		while (active_player_num > 1) {
			let temp_player_name = [];

			for(let i = 0; i < active_player_num; i += 2) {
				await this.showNextPlayers(i);
				const $game = this.$target.querySelector(
					'[data-component="game-div"]'
				);

				if (active_player_num == 2)
					this.$state.lastGame = true;
				const pongGame = new PongGame($game, this.$state); // 게임이 끝나길 기다려야함
				const winnerName = await this.waitForGameEnd(pongGame);
				
				temp_player_name.push(winnerName);
			}

			// 한 게임씩 끝날때마다 적용되게 바꾸기
			this.render();
			
			// 토너먼트 종료 후 다시하기
			if (active_player_num == 2) {
				active_player_num = this.$state.player_num;
				this.$state.active_players_name = this.$state.players_name;
				this.$state.lastGame = false;
			}
			else {
				active_player_num = temp_player_name.length;
				this.$state.active_players_name = temp_player_name;
			}
		}
	}

	async showNextPlayers(idx) {
		const { active_players_name } = this.$state;

		this.setState({ player1: active_players_name[idx], player2: active_players_name[idx + 1] });
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

		$match.style.opacity = value;
	}

	waitForGameEnd(pongGame) {
		return new Promise(resolve => {
			const intervalID = setInterval(() => {
				const winnerName = pongGame.isWinnerName();
				if (winnerName != '') {
					clearInterval(intervalID);
					resolve(winnerName);
				}
			}, 100);
		})
	}
}
