import Component from '../../core/Component.js'

export default class StartPage extends Component {
	template() {
		return `
			<link rel="stylesheet" href="./style/enter/Enter.css">
			<link rel="stylesheet" href="./style/enter/StartPage.css">
			
			<div class="main-box">
				<a href="#game_type/" class="start-a">게임 시작</a>
			</div>
		`;
	}
}