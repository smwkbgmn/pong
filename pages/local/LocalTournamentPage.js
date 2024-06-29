import Component from '../../core/Component.js'

export default class LocalTournamentPage extends Component {
	template() {
		return `
			<link rel="stylesheet" href="./style/enter/Enter.css">
			<link rel="stylesheet" href="./style/local/LocalTournamentPage.css">
			
			<div class="main-box">
				<p class="main-text">토너먼트</p>
				
				<p class="num-text">인원 수</p>
				<input class="num-input"></input>

				<a href="#local_tournament_game/" class="start-a">게임 시작</a>
			</div>
		`;
	}
}