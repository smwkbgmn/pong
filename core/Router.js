import { element } from 'three/examples/jsm/nodes/Nodes.js';
import Component from './Component.js'
// import { logging } from '../pages/enter/ConnectionType.js'

export default class Router extends Component {
	setUp() {
		this.$state = {
			routes: [],
		};
	}

	addRoute(fragment, component) {
		this.$state.routes.push({ fragment, component });
	}

	hasToken() {
		// 토큰값을 그대로 바로 우리 백에 전달함과 동시에
		// 토큰은 이미 얻었기 때문에 DOM 주소창 깨끗하게 만들기
		// 42api 데이터 요청하는 우리 백 api 바로 요청
		// 성공 -> 게임 모드 페이지, 실패 -> 알림 및 메인페이지로 튕기기

		const tokenString = sessionStorage.getItem('token42');
		const token42 = JSON.parse(tokenString);

		// console.log('token42');
		// console.log(tokenString);
		console.log(token42);
		return token42 != null;
	}

	async getToken() {
		await this.waitForEvent(window, 'load').then(() => {
			this.extractToken();
		});
	}

	checkRoutes = () => {
		const currentRoute = this.$state.routes.find((route) => {
			return route.fragment === window.location.hash;
		});

		console.log('hash ' + window.location.hash);
		
		if (window.location.hash == '#/') {
			console.log(sessionStorage.getItem('isLogging'));
			if (sessionStorage.getItem('isLogging') == 'true') {

				console.log('before getToken');
				this.getToken(); // wait 'load' event and extractToken
				console.log('after getToken');

				if ( this.hasToken() == true ) {
					window.location.href = './#game_type/';
					this.$state.routes[0].component();
				}
				else
					currentRoute.component();
			}
			else
				currentRoute.component();
		}

		if (!currentRoute) {
			window.location.href = './#'; //?
			this.$state.routes[0].component();
		}

		// console.log(currentRoute);

		currentRoute.component();
	}
	
	start() {
		window.addEventListener('hashchange', () => this.checkRoutes());

		console.log('hashchange');
		
		if (!window.location.hash) {
			window.location.hash = '#/';
		}
		
		this.checkRoutes();
	}

	setEvent() {
		window.addEventListener('load', this.extractToken);
	}

	waitForEvent(element, eventName) {
		return new Promise(resolve => {
			element.addEventListener(eventName, function handler(event) {
				console.log('event ' + event);
				element.removeEventListener(eventName, handler);
				resolve(event);
			});
		});
	}

	extractToken() {
		const token42 = new URLSearchParams(window.location.search).get('code');

		if (token42) {
			sessionStorage.setItem('token42', JSON.stringify(token42));
			// 백에 전달

			let currentURL = new URL(window.location.href);
			let cleanURL = new URL(currentURL.origin + window.location.hash);
			window.history.replaceState({}, document.title, cleanURL);

			console.log('token42');
		}
		// else
		//	hadling with fail
	}
}

