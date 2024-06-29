import StartPage from './enter/StartPage.js'
import GameTypePage from './enter/GameTypePage.js';
import LocalGamePage from './enter/LocalGamePage.js';
import LocalTournamentPage from './local/LocalTournamentPage.js';
import LobbyPage from './lobby/LobbyPage.js';

export default (main) => {
	const start = () => new StartPage(main);
	const game_type = () => new GameTypePage(main);
	const local_game = () => new LocalGamePage(main);
	const local_tournament = () => new LocalTournamentPage(main);
	const lobby = () => new LobbyPage(main);

	return {
		start,
		game_type,
		local_game,
		local_tournament,
		lobby,
	};
};