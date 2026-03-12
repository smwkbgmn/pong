# Pong Online Tournament

A web-based multiplayer Pong game with real-time WebSocket gameplay and tournament bracket support.

## Stack

- **Backend:** Django 4.2 + Django Channels (WebSocket)
- **Physics:** Pymunk 6.6
- **Database:** PostgreSQL
- **Web Server:** Nginx (HTTPS reverse proxy)
- **Auth:** 42 School OAuth
- **Deployment:** Docker Compose

## Features

- Real-time multiplayer Pong via WebSocket (60 FPS physics updates)
- Tournament matchmaking with configurable bracket sizes
- Automatic match creation and round advancement
- Physics-based ball and paddle collision detection
- 42 School OAuth login

## Prerequisites

- Docker & Docker Compose
- A 42 School OAuth application (client ID + secret)

## Setup

1. Create a `.env` file in the project root:

```env
SECRET_KEY=your_django_secret_key
FOURTY_TWO_CLIENT_ID=your_42_client_id
FOURTY_TWO_CLIENT_SECRET_KEY=your_42_client_secret
FOURTY_TWO_REDIRECT_URI=https://localhost/oauth/callback
DB_VOLUME_PATH=/path/to/postgres/data
WEB_VOLUME_PATH=/path/to/web/data
```

2. Build and start all services:

```bash
make all
```

The app will be available at `https://localhost`.

## Makefile Commands

| Command | Description |
|---|---|
| `make all` | Create data directories, build images, start services |
| `make up` | Start services |
| `make down` | Stop services |
| `make restart` | Restart services |
| `make clean` | Stop and remove containers |
| `make fclean` | Full cleanup (containers, images, volumes) |
| `make re` | Full cleanup and rebuild |

## Architecture

```
Nginx (443 HTTPS)
    └── Django + Daphne (8000)
            ├── HTTP: page rendering, OAuth
            └── WebSocket (/ws/pong): game state, matchmaking
PostgreSQL
    └── User accounts, tournament data
```

## Game Rules

- First player to 3 points wins
- Ball speed increases slightly on each paddle hit
- Tournament: players are queued and matched automatically into a bracket

## Project Structure

```
├── django/
│   ├── source/
│   │   ├── pong/          # Game logic, WebSocket consumer, physics
│   │   ├── users/         # Custom user model and auth
│   │   ├── oauth/         # 42 OAuth callback
│   │   └── source/        # Django settings, ASGI/WSGI config
│   └── requirements/
├── nginx/                 # Nginx config and SSL certs
├── postgres/              # DB init scripts
├── docker-compose.yml
└── Makefile
```
