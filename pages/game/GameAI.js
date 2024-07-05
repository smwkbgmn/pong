import Component from '../../core/Component.js'

export default class GameAI extends Component {
	template() {
		return `
			<link rel="stylesheet" href="./style/Game.css">
			<link rel="stylesheet" href="./style/game/GameAI.css">
			
			<p class="main-text">AI 게임 페이지</p>

			<a href="#local_tournament_game/" class="start-a">게임 시작</a>
		`;
	}
}
