#include "Client.hpp"

PongClient::PongClient(): _ball_x(0), _ball_y(0), _paddle_left_y(0), _paddle_right_y(0) {
	_client.init_asio();

	_client.set_open_handler(bind(&on_open, this, _1));
	_client.set_message_handler(bind(&on_message, this, _1, _2));
}

void PongClient::connect(const std::string& uri) {
	websocketpp::lib::error_code ec;
	client::connection_ptr con = _client.get_connection(uri, ec);
	if (ec) {
		std::cout << "Could not create connection: " << ec.message() << std::endl;
		return;
	}

	_client.connect(con);
	_client.run();
}

void PongClient::run_game() {
	if (SDL_Init(SDL_INIT_VIDEO) < 0) {
		std::cout << "SDL could not initialize! SDL_Error: " << SDL_GetError() << std::endl;
		return;
	}

	SDL_Window* window = SDL_CreateWindow("Pong Client", SDL_WINDOWPOS_UNDEFINED, SDL_WINDOWPOS_UNDEFINED, 800, 600, SDL_WINDOW_SHOWN);
	if (window == nullptr) {
		std::cout << "Window could not be created! SDL_Error: " << SDL_GetError() << std::endl;
		return;
	}

	SDL_Renderer* renderer = SDL_CreateRenderer(window, -1, SDL_RENDERER_ACCELERATED);
	if (renderer == nullptr) {
		std::cout << "Renderer could not be created! SDL_Error: " << SDL_GetError() << std::endl;
		return;
	}

	bool quit = false;
	SDL_Event e;

	while (!quit) {
		while (SDL_PollEvent(&e) != 0) {
			if (e.type == SDL_QUIT) {
				quit = true;
			}
			else if (e.type == SDL_MOUSEMOTION) {
				int mouse_y = e.motion.y;
				send_player_move(mouse_y);
			}
		}

		SDL_SetRenderDrawColor(renderer, 0, 0, 0, 255);
		SDL_RenderClear(renderer);

		// Draw paddles and ball
		SDL_SetRenderDrawColor(renderer, 255, 255, 255, 255);
		SDL_Rect left_paddle = {50, static_cast<int>(_paddle_left_y * 300 + 300), 20, 100};
		SDL_Rect right_paddle = {730, static_cast<int>(_paddle_right_y * 300 + 300), 20, 100};
		SDL_Rect ball = {static_cast<int>(_ball_x * 400 + 400), static_cast<int>(_ball_y * 300 + 300), 20, 20};

		SDL_RenderFillRect(renderer, &left_paddle);
		SDL_RenderFillRect(renderer, &right_paddle);
		SDL_RenderFillRect(renderer, &ball);

		SDL_RenderPresent(renderer);
	}

	SDL_DestroyRenderer(renderer);
	SDL_DestroyWindow(window);
	SDL_Quit();
}

void PongClient::on_open(websocketpp::connection_hdl hdl) {
	_client.send(hdl, json{{"type", "requestMatch"}, {"playerName", "C++ Player"}, {"playerImage", "default"}, {"tournamentSize", 2}}.dump(), websocketpp::frame::opcode::text);
}

void PongClient::on_message(websocketpp::connection_hdl hdl, client::message_ptr msg) {
	json data = json::parse(msg->get_payload());

	switch (event_type(data["type"])) {
		case E_GAME_UPDATE: {
			_ball_x = data["ball_position"]["x"];
			_ball_y = data["ball_position"]["y"];
			_paddle_left_y = data["left_paddle_position_y"];
			_paddle_right_y = data["right_paddle_position_y"];
			break;
		}
		case E_MATCH_FOUND: {
			std::cout << "Match found! Game ID: " << data["game_id"] << std::endl;
			_client.send(hdl, json{{"type", "joinRoom"}, {"gameId", data["game_id"]}, {"side", data["side"]}}.dump(), websocketpp::frame::opcode::text);
			break;
		}
		// Handle other message types as needed
	}
}

void PongClient::send_player_move(int y) {
	if (_connection && _connection->get_state() == websocketpp::session::state::open) {
            float normalized_y = (y - 300) / 300.0f;  // Normalize to -1 to 1 range
            _client.send(_connection, json{{"type", "playerMove"}, {"movedY", normalized_y}}.dump(), websocketpp::frame::opcode::text);
        }
}

