import Component from '../../core/Component.js'

export default class GameTournament extends Component {
	template() {
		return `
			<link rel="stylesheet" href="./style/Home.css">
			<link rel="stylesheet" href="./style/game/GameTournament.css">
			
			<div class="main-box">
				<p class="main-text">토너먼트 게임 페이지</p>

				<a href="#local_tournament_game/" class="start-a">게임 시작</a>
			</div>
		`;
	}
}
