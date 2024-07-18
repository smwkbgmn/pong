import Component from '../../core/Component.js'

const clientID = 'u-s4t2ud-ffe307ba0889574ea9737775e70526b8e6ba5c1aac4b9b0e80086de8f383c9ab';
const redirectURI = 'http://localhost:8000/';

export default class ConnectionType extends Component {
	template() {
		return `
			<link rel="stylesheet" href="/static/style/Home.css">
			<link rel="stylesheet" href="/static/style/enter/ConnectionType.css">
			
			<div class="main-div">
				<a class="home-a" href="#/">
					<img class="home-img" src="/static/asset/home-icon.png">
				</a>

				<p class="main-p">게임 모드</p>
				<botton class="online-btn">온라인 게임</botton>
				<a class="local-a" href="#game_type/">로컬 게임</a>
			</div>
		`;
	}

	setEvent() {
		this.addEvent('click', '.online-btn', async ({ target }) => {
			sessionStorage.setItem('isLogging', true);
			const authURL = `https://api.intra.42.fr/oauth/authorize?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=public`;
			window.location.href = authURL;
		});
	}
}
