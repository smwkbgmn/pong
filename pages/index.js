import StartPage from './enter/StartPage.js'
import ConnectionType from './enter/ConnectionType.js';
import GameType from './enter/GameType.js';
import TournamentGame from './game/TournamentGame.js';
import AIGame from './game/AIGame.js';

export default (main) => {
	const start = () => new StartPage(main);
	const connection_type = () => new ConnectionType(main);
	const game_type = () => new GameType(main);
	const tournament_game = () => new TournamentGame(main);
	const ai_game = () => new AIGame(main);

	return {
		start,
		connection_type,
		game_type,
		tournament_game,
		ai_game,
	};
};