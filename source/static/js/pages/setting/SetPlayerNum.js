import Component from '../../core/Component.js'
import * as Utils from '../../Utils.js'

export default class SetPlayerNum extends Component {
	setUp() {
		this.$state = {
			playerNum: '2',
		};
	}

	template() {
		const { playerNum } = this.$state;

		return `			
			<div class="main-div">
				<a class="home-a" href="#/">
					<img class="home-img" src="/static/asset/home-icon.png">
				</a>
				
				<p class="main-p">토너먼트</p>

				<p class="num-p">인원 수</p>
				<div class="num-dropdown dropend">
					<button class="btn text-white dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" style="background-color: rgba(200, 200, 200, 0.5);">${playerNum}</button>
						<ul class="dropdown-menu">
						<li><p id="num_2" class="dropdown-item">2</p></li>
						<li><p id="num_4" class="dropdown-item">4</p></li>
						<li><p id="num_8" class="dropdown-item">8</p></li>
						</ul>
				</div>

				<button class="start-btn">다음</button>
			</div>
		`;
	}

	setEvent() {
		this.addEvent('click', '#num_2', ({ target }) => {
			this.printNum('2');
		});
		this.addEvent('click', '#num_4', ({ target }) => {
			this.printNum('4');
		});
		this.addEvent('click', '#num_8', ({ target }) => {
			this.printNum('8');
		});

		this.addEvent('click', '.start-btn', ({ target }) => {
			Utils.setStringifiedItem('playerNum', this.$state.playerNum);

			if (Utils.getParsedItem('isLoggedIn') == true)
				Utils.changeFragment('#game_matchmaking/');
			else
				Utils.changeFragment('#set_name_tournament/');
		});
	}

	printNum(newNum) {
		this.setState({ playerNum: newNum });
	}
}
