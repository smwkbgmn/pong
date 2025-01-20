cmake_minimum_required(VERSION 3.15)
project(PongClient CXX)

# Find and include Conan-generated configuration
find_package(websocketpp REQUIRED)
find_package(nlohmann_json REQUIRED)
find_package(sdl2)

# Add your executable
add_executable(pong_client main.cpp)

# Link libraries
target_link_libraries(pong_client PRIVATE websocketpp::websocketpp nlohmann_json::nlohmann_json)

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)