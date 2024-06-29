import Component from '../../core/Component.js'

export default class LocalGamePage extends Component {
	template() {
		return `
			<div class="background">
				<link rel="stylesheet" href="./style/enter/Enter.css">
				<link rel="stylesheet" href="./style/enter/LocalGamePage.css">
				
				<div class="main-box">
					<p class="main-text">게임 모드</p>
					<a href="#local-tournament/" class="tournament-a">토너먼트</a>
					<a href="#local-ai/" class="ai-a">AI 대전</a>
				</div>
			</div>
		`;
	}
}