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
		router.addRoute('#game_type/', pages.game_type);
		router.addRoute('#local_game/', pages.local_game);
		router.addRoute('#local_tournament/', pages.local_tournament);
		router.addRoute('#lobby/', pages.lobby);

		router.start();
	}
}