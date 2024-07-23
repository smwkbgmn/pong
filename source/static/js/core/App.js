import Router from "./Router.js"
import Component from "./Component.js"
import createPages from "../pages/index.js"
import Background from "../pages/Background.js"
import * as Utils from '../Utils.js'

export default class App extends Component {
	template() {
		return `
		<head>
			<link rel="stylesheet" href="/static/style/Home.css">
			<link rel="stylesheet" href="/static/style/enter/StartPage.css">
			<link rel="stylesheet" href="/static/style/enter/ConnectionType.css">
			<link rel="stylesheet" href="/static/style/enter/GameType.css">
			<link rel="stylesheet" href="/static/style/setting/SetPlayerNum.css">
			<link rel="stylesheet" href="/static/style/setting/SetNameAI.css">
			<link rel="stylesheet" href="/static/style/setting/SetNameTournament.css">
			<link rel="stylesheet" href="/static/style/Game.css">
			<link rel="stylesheet" href="/static/style/game/GameAI.css">
			<link rel="stylesheet" href="/static/style/game/GameTournament.css">
			<link rel="stylesheet" href="/static/style/game/Matchmaking.css">
		</head>
		<main>
			// <canvas data-component="Background-canvas"></canvas>
		</main>
		`;
	}

	setUp() {
		if (Utils.getParsedItem('isLogging') == null)
			Utils.setStringifiedItem('isLogging', false);
		if (Utils.getParsedItem('isLoggedIn') == null)
			Utils.setStringifiedItem('isLoggedIn', false);
	}
	
	mounted() {
		const $Background = this.$target.querySelector(
			'[data-conponent="Background-canvas"]'
		);
		new Background($Background);
		
		const $main = this.$target.querySelector('main');
		const pages = createPages($main);

		const router = new Router($main);
		router.addRoute('#/', pages.start);
		router.addRoute('#connection_type/', pages.connection_type);
		router.addRoute('#game_type/', pages.game_type);
		router.addRoute('#set_player_num/', pages.set_player_num);
		router.addRoute('#game_tournament/', pages.game_tournament);
		router.addRoute('#matchmaking/', pages.matchmaking);
		router.addRoute('#set_name_tournament/', pages.set_name_tournament);
		router.addRoute('#game_ai/', pages.game_ai);
		router.addRoute('#set_name_ai/', pages.set_name_ai);

		router.start();
	}
}
