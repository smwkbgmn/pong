import Component from '../../core/Component.js'

export default class Gametype extends Component {
	template() {
		return `
			<link rel="stylesheet" href="./style/Common.css">
			<link rel="stylesheet" href="./style/enter/GameType.css">
			
			<div class="main-box">
				<p class="main-text">게임 모드</p>
				<a href="#tournament_game/" class="tournament-a">토너먼트</a>
				<a href="#ai_game/" class="ai-a">AI 대전</a>
			</div>
		`;
	}
}