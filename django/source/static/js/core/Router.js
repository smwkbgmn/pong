import Component from './Component.js'
import * as Account from '../api/Account.js'
import * as Utils from '../Utils.js'

export default class Router extends Component {
	setUp() {
		this.$state = {
			routes: [],
		};
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
		Utils.setStringifiedItem('prevHash', Utils.getParsedItem('curHash'));
		Utils.setStringifiedItem('curHash', window.location.hash);
		
		const currentRoute = this.$state.routes.find((route) => {
			return route.fragment === window.location.hash;
		});

		if (!currentRoute)
			return Utils.changeFragment('#/');

		if (window.location.hash == '#/') {
			if (Utils.getParsedItem('isLogging') == true)
				await this.handleOAuthRedirect();

			if (Utils.getParsedItem('isLoggedIn') == true)
				return Utils.changeFragment('#game_type/');
		}

		currentRoute.component();
	}

	async handleOAuthRedirect() {
		const token = await Account.extractToken();
		if (token)
			await Account.initialToken(token);
	}
}