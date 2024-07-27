import EnterStart from './enter/EnterStart.js'
import EnterConnectionType from './enter/EnterConnectionType.js';
import EnterGameType from './enter/EnterGameType.js';
import SetPlayerNum from './setting/SetPlayerNum.js';
import SetNameTournament from './setting/SetNameTournament.js';
import SetNameAI from './setting/SetNameAI.js';
import GameAI from './game/local/GameAI.js';
import GameTournament from './game/local/GameTournament.js';
import GameMatchmaking from './game/online/GameMatchmaking.js';
import GameMatch from './game/online/GameMatch.js';
import * as Utils from '../Utils.js'

export default (main) => {
	const start = () => new EnterStart(main);
	const connection_type = () => new EnterConnectionType(main);
	const game_type = () => new EnterGameType(main);
	const set_player_num = () => new SetPlayerNum(main);
	const set_name_ai = () => new SetNameAI(main);
	const set_name_tournament = () => new SetNameTournament(main);
	const game_ai = () => new GameAI(main);
	const game_tournament = () => new GameTournament(main);
	const game_matchmaking = () => new GameMatchmaking(main);
	const game_match = () => new GameMatch(main);

	return {
		start,
		connection_type,
		game_type,
		set_player_num,
		set_name_ai,
		set_name_tournament,
		game_ai,
		game_tournament,
		game_matchmaking,
		game_match,
	};
};