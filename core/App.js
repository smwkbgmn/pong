import Router from "./Router.js"
import Component from "./Component.js"
import createPages from "../pages/index.js"
import Three from "../pages/Background.js"

export default class App extends Component {
	template() {
		return `
		<head></head>
		<main>
			<canvas data-component="three"></canvas>
		</main>
		`;
	}
	
	mounted() {
		const $three = this.$target.querySelector(
			'[data-conponent="three"]'
		);
		new Three($three);
		
		const $main = this.$target.querySelector('main');
		const pages = createPages($main);

		const router = new Router($main);
		router.addRoute('#/', pages.start);
		router.addRoute('#connection_type/', pages.connection_type);
		router.addRoute('#game_type/', pages.game_type);
		router.addRoute('#tournament_game/', pages.tournament_game);
		router.addRoute('#ai_game/', pages.ai_game);

		router.start();
	}
}