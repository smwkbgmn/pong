import Component from '../../core/Component.js'
import * as Account from '../../api/Account.js'

export default class ConnectionType extends Component {
	template() {
		return `
			<link rel="stylesheet" href="./style/Home.css">
			<link rel="stylesheet" href="./style/enter/ConnectionType.css">
			
			<div class="main-div">
				<a class="home-a" href="#/">
					<img class="home-img" src="./asset/home-icon.png">
				</a>

				<p class="main-p">게임 모드</p>
				<botton class="online-btn">온라인 게임</botton>
				<a class="local-a" href="#game_type/">로컬 게임</a>
			</div>
		`;
	}

	setEvent() {
		this.addEvent('click', '.online-btn', async ({ target }) => {
			await Account.attemptLogin();
			window.location.href = './#game_type/';
		});
	}
}