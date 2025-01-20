#include "Client.hpp"

const str_t uri = "wss://localhost/ws/pong/";

int main() {
    PongClient cl;

    std::thread websocket_thread([&cl]() {
        cl.connect(uri);
    });

    cl.run_game();
    websocket_thread.join();

    return 0;
}