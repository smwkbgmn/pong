import Component from '../../core/Component.js'

export default class LocalTournamentPage extends Component {
	setUp() {
		this.$state = {
			num: '4  ',
		};
	}

	template() {
		const { num } = this.$state;
		return `
			<link rel="stylesheet" href="./style/enter/Enter.css">
			<link rel="stylesheet" href="./style/local/LocalTournamentPage.css">
			
			<div class="main-box">
				<p class="main-text">토너먼트</p>

				<p class="num-text">인원 수</p>
				<div class="num-dropdown dropend">
					<button class="btn text-white dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" style="background-color: rgba(200, 200, 200, 0.5);">${num}</botton>
						<ul class="dropdown-menu">
						<li><p id="num_4" class="dropdown-item">4</p></li>
						<li><p id="num_6" class="dropdown-item">6</p></li>
						<li><p id="num_8" class="dropdown-item">8</p></li>
						</ul>
				</div>

				<a href="#local_tournament_game/" class="start-a">게임 시작</a>
			</div>
		`;
	}

	setEvent() {
		this.addEvent('click', '#num_4', ({ target }) => {
			this.printNum('4  ');
		});
		this.addEvent('click', '#num_6', ({ target }) => {
			this.printNum('6  ');
		});
		this.addEvent('click', '#num_8', ({ target }) => {
			this.printNum('8  ');
		});
	}

	printNum(newNum) {
		this.setState({ num: newNum });
	}
}
