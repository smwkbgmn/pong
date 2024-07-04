import Component from '../../core/Component.js'

export default class Gametype extends Component {
	template() {
		return `
			<link rel="stylesheet" href="./style/Common.css">
			<link rel="stylesheet" href="./style/enter/GameType.css">
			
			<div class="main-box">
				<p class="main-text">게임 모드</p>
				<a href="#mode_tournament/" class="tournament-a">토너먼트</a>
				<botton href="#mode_ai/" class="ai-btn">AI 대전</botton>
			</div>
		`;
	}

	setEvent() {
		this.addEvent('click', '.ai-btn', ({ target }) => {
			if (sessionStorage.getItem('isLogging') == 'true')
				window.location.href = './#game_ai/';
			else
				window.location.href = './#set_name_ai/';
		});
	}
}