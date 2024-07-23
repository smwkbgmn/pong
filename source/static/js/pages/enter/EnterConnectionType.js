import Component from '../../core/Component.js'
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
		this.addEvent('click', '.home-btn', () => {
			if (Utils.getParsedItem('isLogging') == true)
				Utils.setStringifiedItem('isLogging', false);
			Utils.changeFragment('#/');
		});

		this.addEvent('click', '.online-btn', () => {
			Utils.setStringifiedItem('isLogging', true);
			Account.requestOAuth();
		});
	}
}
