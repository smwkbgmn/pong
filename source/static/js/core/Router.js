import Component from './Component.js'
import * as Account from '../api/Account.js'

export default class Router extends Component {
	setUp() {
		this.$state = {
			routes: [],
		};
	
		sessionStorage.setItem('isLoggedIn', false);
	}

	addRoute(fragment, component) {
		this.$state.routes.push({ fragment, component });
	}

	async checkRoutes() {
		console.log('current hash: ' + window.location.hash);
		
		const currentRoute = this.$state.routes.find((route) => {
			return route.fragment === window.location.hash;
		});
		
		let isLoggedIn = sessionStorage.getItem('isLoggedIn');
		if (isLoggedIn == 'true') {
			const response = await Account.validateToken();
			if (response.success == false) {
				console.log(response.message);

				sessionStorage.setItem('isLoggedIn', false);
				window.location.href = './#connection_type/';
			}
		}

		if (window.location.hash == '#/') {
			if (sessionStorage.getItem('isLogging') == 'true') {
				await this.waitForLoad().then(() => {
					this.extractToken();
				})

				await Account.attemptLogin();

				console.log('isLogging ' + sessionStorage.getItem('isLogging'));
				console.log('isLoggedIn ' + sessionStorage.getItem('isLoggedIn'));
				console.log(sessionStorage.getItem('playerName'));
				console.log(sessionStorage.getItem('playerImage'));
				console.log(sessionStorage.getItem('accessToken'));
				console.log(sessionStorage.getItem('refreshToken'));
			}

			if (sessionStorage.getItem('isLoggedIn') == 'true') {
				window.location.href = './#game_type/';
				return ;
			}
			else
				currentRoute.component();
		}

		if (!currentRoute) {
			console.log('no current route');
			window.location.href = './#/';
			return ;
		}

		currentRoute.component();
	}
	
	start() {
		window.addEventListener('hashchange', () => this.checkRoutes());

		if (!window.location.hash) {
			window.location.hash = '#/';
			return ;
		}
		
		this.checkRoutes();
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
			sessionStorage.setItem('token42', JSON.stringify(token42));

			let currentURL = new URL(window.location.href);
			let cleanURL = new URL(currentURL.origin + window.location.hash);
			window.history.replaceState({}, document.title, cleanURL);

			console.log('token42');
		}
		// else
		//	hadling with fail
	}
}
