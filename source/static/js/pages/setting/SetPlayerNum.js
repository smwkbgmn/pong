import Component from '../../core/Component.js'
import * as Event from '../../core/Event.js'
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
		this.unmountedBinded = Event.addHashChangeEvent(this.unmounted.bind(this));

		this.printNumWrapped2 = Event.addEvent(this.$target, 'click', '#num_2', this.printNum.bind(this, '2'));
		this.printNumWrapped4 = Event.addEvent(this.$target, 'click', '#num_4', this.printNum.bind(this, '4'));
		this.printNumWrapped8 = Event.addEvent(this.$target, 'click', '#num_8', this.printNum.bind(this, '8'));

		this.clickedStartButtonWrapped = Event.addEvent(this.$target, 'click', '.start-btn', this.clickedStartButton.bind(this));
	}

	clearEvent() {
		Event.removeHashChangeEvent(this.unmountedBinded);

		Event.removeEvent(this.$target, 'click', this.printNumWrapped2);
		Event.removeEvent(this.$target, 'click', this.printNumWrapped4);
		Event.removeEvent(this.$target, 'click', this.printNumWrapped8);

		Event.removeEvent(this.$target, 'click', this.clickedStartButtonWrapped);
	}
	
	printNum(newNum) {
		this.setState({ playerNum: newNum });
	}
	
	clickedStartButton() {
		Utils.setStringifiedItem('playerNum', Number(this.$state.playerNum));
	
		if (Utils.getParsedItem('isLoggedIn') == true)
			Utils.changeFragment('#game_matchmaking/');
		else
			Utils.changeFragment('#set_name_tournament/');
	}
}
