message(STATUS "Conan: Using CMakeDeps conandeps_legacy.cmake aggregator via include()")
message(STATUS "Conan: It is recommended to use explicit find_package() per dependency instead")

find_package(websocketpp)
find_package(nlohmann_json)
find_package(SDL2)

set(CONANDEPS_LEGACY  websocketpp::websocketpp  nlohmann_json::nlohmann_json  SDL2::SDL2main )