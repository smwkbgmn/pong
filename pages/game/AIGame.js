import Component from '../../core/Component.js'

export default class AIGame extends Component {
	setUp() {
		this.$state = {
			num: '2  ',
		};
	}

	template() {
		const { num } = this.$state;
		return `
			<link rel="stylesheet" href="./style/Common.css">
			<link rel="stylesheet" href="./style/game/AIGame.css">
			
			<div class="main-box">
				<p class="main-text">AI랑 게임하는 페이지</p>
			
				<a href="#local_tournament_game/" class="start-a">게임 시작</a>
			</div>
		`;
	}

	setEvent() {
		this.addEvent('click', '#num_2', ({ target }) => {
			this.printNum('2  ');
		});
		this.addEvent('click', '#num_4', ({ target }) => {
			this.printNum('4  ');
		});
		this.addEvent('click', '#num_8', ({ target }) => {
			this.printNum('8  ');
		});
	}

	printNum(newNum) {
		this.setState({ num: newNum });
	}
}
