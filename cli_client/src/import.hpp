#ifndef IMPORT_HPP
# define IMPORT_HPP

# include <websocketpp/config/asio_no_tls_client.hpp>
# include <websocketpp/client.hpp>
# include <nlohmann/json.hpp>
# include <SDL.h> // Simple DirectMedia Layer

using json = nlohmann::json;
using websocketpp::lib::placeholders::_1;
using websocketpp::lib::placeholders::_2;
using websocketpp::lib::bind;

typedef websocketpp::client<websocketpp::config::asio_client> client;

#endif