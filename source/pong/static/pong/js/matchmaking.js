import PongRender from "./render.js";

let game = null;
let socket = null;

document.addEventListener('DOMContentLoaded', () => {
	const matchButton = document.getElementById('findMatch');
    const statusDiv = document.getElementById('status');
    const tournSizeSelect = document.getElementById('tournamentSize');

	statusDiv.textContent = 'Select the tournament size and find match!';
	
    if (matchButton) {
		matchButton.addEventListener('click', () => {
			statusDiv.textContent = 'Connecting to server...';
			
            setSocket(statusDiv, parseInt(tournSizeSelect.value));
        });
    }
});

function setSocket(statusDiv, tournSize) {
	socket = new WebSocket('ws://' + window.location.host + '/ws/pong');

	socket.onopen = function(event) {
		statusDiv.textContent = `Searching for a ${tournSize}-player tournament...`;

		socket.send(JSON.stringify({
			type			: 'requestMatch',
			tournamentSize	: tournSize
		}));
	};

	socket.onmessage = function(event) {
		const data = JSON.parse(event.data);

		switch(data.type) {
			case 'match_found':
				statusDiv.textContent = 'Match found! Starting game...';
				startGame(data.gameId, data.side, socket);
				break;

			case 'waiting_for_players':
				statusDiv.textContent = `Waiting for more players... ${data.curnt_players}/${data.tourn_size}`;
				break;

			case 'game_update':
				if (game) game.updateGameObjects(data);
				break;

			case 'game_finish':
				game.cleanUp();
				game = null;
				break;

			case 'round_wait':
			case 'round_end':
			case 'tournament_win':
				roundNext(statusDiv, data);
				break;
		}
	};

	socket.onclose = function(event) {
		if (game) {
			game.cleanUp();
			game = null;

			document.getElementById('matchmaking-container').style.display = 'block';
			document.getElementById('game-container').style.display = 'none';

			statusDiv.textContent = 'Disconnected from server. Please refresh the page to reconnect.';
		}
	};

	socket.onerror = function(error) {
		statusDiv.textContent = 'Error connecting to the server. Please try again later.';
		console.error('WebSocket Error:', error);
	};
}

function startGame(gameId, side, socket) {
    document.getElementById('matchmaking-container').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';

    game = new PongRender(gameId, side, socket);
}

function roundNext(statusDiv, data) {
	document.getElementById('matchmaking-container').style.display = 'block';
    document.getElementById('game-container').style.display = 'none';

	if (data.type == "round_wait") roundWait(statusDiv);
	else if (data.type == "round_end") roundEnd(statusDiv);
	else tournamentWin(statusDiv);
}

function roundWait(statusDiv) {
	console.log("receive round_wait from server");
	statusDiv.textContent = `Waiting for other players to finish the game`;
}

function roundEnd(statusDiv) {
	console.log("receive round_end from server");
	statusDiv.textContent = `Your game has done.\nHave you enjoyed?`;

	if (socket && socket.readyState === WebSocket.OPEN) {
		socket.close();
		socket = null;
	}
}

function tournamentWin(statusDiv) {
	console.log("receive tournament_win from server");
	statusDiv.textContent = `CONGRATULATION!!\nYOU ARE THE WINNER!!`;
}