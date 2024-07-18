import Component from '../../core/Component.js'

export default class StartPage extends Component {
	template() {
		return `
			<link rel="stylesheet" href="/static/style/Home.css">
			<link rel="stylesheet" href="/static/style/enter/StartPage.css">
			
			<div class="main-div">
				<a href="#connection_type/" class="start-a">게임 시작</a>
			</div>
		`;
	}
}
