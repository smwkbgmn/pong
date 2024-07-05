import Component from '../../core/Component.js'

export default class GameAI extends Component {
	template() {
		return `
			<link rel="stylesheet" href="./style/Game.css">
			<link rel="stylesheet" href="./style/game/GameAI.css">
			
			<p class="main-p">AI 게임 페이지</p>

			<a class="start-a" href="#local_tournament_game/">게임 시작</a>
		`;
	}
}
