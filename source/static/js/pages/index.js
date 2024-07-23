import StartPage from './enter/StartPage.js'
import ConnectionType from './enter/ConnectionType.js';
import GameType from './enter/GameType.js';
import SetPlayerNum from './setting/SetPlayerNum.js';
import SetNameTournament from './setting/SetNameTournament.js';
import SetNameAI from './setting/SetNameAI.js';
import GameAI from './game/GameAI.js';
import GameTournament from './game/GameTournament.js';
import Matchmaking from './game/Matchmaking.js';

export default (main) => {
	const start = () => new StartPage(main);
	const connection_type = () => new ConnectionType(main);
	const game_type = () => new GameType(main);
	const set_player_num = () => new SetPlayerNum(main);
	const set_name_ai = () => new SetNameAI(main);
	const set_name_tournament = () => new SetNameTournament(main);
	const game_ai = () => new GameAI(main);
	const game_tournament = () => new GameTournament(main);
	const matchmaking = () => new Matchmaking(main);

	return {
		start,
		connection_type,
		game_type,
		set_player_num,
		set_name_ai,
		set_name_tournament,
		game_ai,
		game_tournament,
		matchmaking,
	};
};