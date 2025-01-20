/*
	USAGE OF CONAN2 PACKGE MANAGER
	write/modify conanfile.txt
	conan install . --output-folder=build --build=missing
	cd build
	cmake .. -DCMAKE_TOOLCHAIN_FILE=conan_toolchain.cmake -DCMAKE_BUILD_TYPE=Release
	cmake --build .
*/

#ifndef CLIENT_HPP
# define CLIENT_HPP

# include "structure.hpp"
# include "import.hpp"

enum event_type_e {
	E_GAME_UPDATE,
	E_MATCH_FOUND
};

const map_str_int_t event_type {
	{"game_update", 0},
	{"match_found", 1}
};

class PongClient {
	public:
		PongClient();
		
		void	connect(const str_t&);
		void	run_game();
		void	on_open(websocketpp::connection_hdl);
		void	on_message(websocketpp::connection_hdl, client::message_ptr);
		void	send_player_move(int);
		
	private:
		client	_client;
		client::connection_ptr _connection;
		float	_ball_x, _ball_y;
		float	_paddle_left_y, _paddle_right_y;
};

#endif












