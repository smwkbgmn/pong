import Component from './Component.js'
import * as Account from '../api/Account.js'
import * as Utils from '../Utils.js'

export default class Router extends Component {
	setUp() {
		this.$state = {
			routes: [],
		};
	
		Utils.setStringifiedItem('isLoggedIn', false);
	}

	addRoute(fragment, component) {
		this.$state.routes.push({ fragment, component });
	}
	
	start() {
		window.addEventListener('hashchange', () => this.checkRoutes());

		if (!window.location.hash)
			return Utils.changeFragment('#/');
		
		this.checkRoutes();
	}

	async checkRoutes() {
		console.log('current hash: ' + window.location.hash);
		
		const currentRoute = this.$state.routes.find((route) => {
			return route.fragment === window.location.hash;
		});
		
		if (Utils.getParsedItem('isLoggedIn') == true)
			await this.validateUserSession();

		if (window.location.hash == '#/') {
			if (Utils.getParsedItem('isLogging') == true)
				await this.handleOAuthRedirect();

			if (Utils.getParsedItem('isLoggedIn') == true)
				return Utils.changeFragment('#game_type/');
			else
				currentRoute.component();
		}

		if (!currentRoute)
			return Utils.changeFragment('#/');

		currentRoute.component();
	}

	async validateUserSession() {
		await Account.validateToken().then(response => {
			if (response.success == false) {
				console.log(response.message);
	
				Utils.setStringifiedItem('isLoggedIn', false);
				Utils.changeFragment('#connection_type/');
			}
		})
	}

	async handleOAuthRedirect() {
		await this.waitForLoad().then(() => {
			this.extractToken();
		})

		await Account.initialToken();

		console.log('isLogging ' + Utils.getParsedItem('isLogging'));
		console.log('isLoggedIn ' + Utils.getParsedItem('isLoggedIn'));
		console.log(Utils.getParsedItem('playerName'));
		console.log(Utils.getParsedItem('playerImage'));
		console.log(Utils.getParsedItem('accessToken'));
		console.log(Utils.getParsedItem('refreshToken'));
	}

	// new Promise() 메서드 호출 시 resolve와 reject를 인자로 대기 상태 진입
	// resolve()를 실행하면 이행 상태가 되어 promise 종료
	// reject는 실패 상태로 종료
	// 콜백 함수에서 이벤트를 등록하고, load 이벤트 핸들러에서 resolve를 실행하기 때문에
	// 이벤트가 발생할 때까지 promise는 대기 상태이고 종료될 때까지 await 했기 때문에
	// 이벤트 발생 대기가 가능함
	waitForLoad() {
		return new Promise((resolve, reject) => {
			window.addEventListener('load', function handler(event) {
				window.removeEventListener('load', handler);
				resolve(event);
			});
		});
	}

	extractToken() {
		const token42 = new URLSearchParams(window.location.search).get('code');

		if (token42) {
			Utils.setStringifiedItem('token42', token42);

			let currentURL = new URL(window.location.href);
			let cleanURL = new URL(currentURL.origin + window.location.hash);
			window.history.replaceState({}, document.title, cleanURL);

			console.log('token42');
		}
		// else
		//	hadling with fail
	}
}
