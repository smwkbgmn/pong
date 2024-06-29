import Component from '../../core/Component.js'

export default class GameTypePage extends Component {
	template() {
		return `
			<link rel="stylesheet" href="./style/enter/Enter.css">
			<link rel="stylesheet" href="./style/enter/GameTypePage.css">
			
			<div class="main-box">
				<p class="main-text">게임 모드</p>
				<a href="#lobby/" class="remote-a">온라인 게임</a>
				<a href="#local_game/" class="local-a">로컬 게임</a>
			</div>
		`;
	}
}
			// <button class="remote-btn">온라인 게임</button>