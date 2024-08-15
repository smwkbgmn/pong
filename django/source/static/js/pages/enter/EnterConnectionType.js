import Component from '../../core/Component.js'
import * as Event from '../../core/Event.js'
import * as Account from '../../api/Account.js'
import * as Utils from '../../Utils.js'

export default class ConnectionType extends Component {
	template() {
		return `
			<div class="main-div">
				<button class="home-btn">
					<img class="home-img" src="/static/asset/home-icon.png">
				</button>

				<p class="main-p">게임 모드</p>
				<button class="online-btn">온라인 게임</button>
				<a class="local-a" href="#game_type/">로컬 게임</a>
			</div>
		`;
	}

	setEvent() {
		this.unmountedBinded = Event.addHashChangeEvent(this.unmounted.bind(this));
		this.clickedHomeButtonWrapped = Event.addEvent(this.$target, 'click', '.home-btn', this.clickedHomeButton.bind(this));
		this.clickedOnlineButtonWrapped = Event.addEvent(this.$target, 'click', '.online-btn', this.clickedOnlineButton.bind(this));
	}

	clearEvent() {
		Event.removeHashChangeEvent(this.unmountedBinded);
		Event.removeEvent(this.$target, 'click', this.clickedHomeButtonWrapped);
		Event.removeEvent(this.$target, 'click', this.clickedOnlineButtonWrapped);
	}

	clickedHomeButton() {
		if (Utils.getParsedItem('isLogging') == true)
			Utils.setStringifiedItem('isLogging', false);
		Utils.changeFragment('#/');
	}
	
	clickedOnlineButton() {
		Utils.setStringifiedItem('isLogging', true);
		Account.requestOAuth();
	}
}
