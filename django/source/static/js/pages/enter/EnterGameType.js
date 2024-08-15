import Component from '../../core/Component.js'
import * as Event from '../../core/Event.js'
import * as Utils from '../../Utils.js'

export default class EnterGametype extends Component {
	template() {
		return `			
			<div class="main-div">
				<a class="home-a" href="#/">
					<img class="home-img" src="/static/asset/home-icon.png">
				</a>
				
				<p class="main-p">게임 모드</p>
				<a class="tournament-a" href="#set_player_num/">토너먼트</a>
				<button class="ai-btn">AI 대전</button>
			</div>
		`;
	}

	setEvent() {
		this.unmountedBinded = Event.addHashChangeEvent(this.unmounted.bind(this));
		this.clickedAIButtonWrapped = Event.addEvent(this.$target, 'click', '.ai-btn', this.clickedAIButton.bind(this));
	}

	clearEvent() {
		Event.removeHashChangeEvent(this.unmountedBinded);
		Event.removeEvent(this.$target, 'click', this.clickedAIButtonWrapped);
	}

	clickedAIButton() {
		if (Utils.getParsedItem('isLoggedIn') == true)
			Utils.changeFragment('#game_ai/');
		else
			Utils.changeFragment('#set_name_ai/');
	}
}
