all:
	mkdir -p data data/web data/db
	docker-compose -f $(PWD)/docker-compose.yml up -d --build

clean:
	docker-compose -f $(PWD)/docker-compose.yml down

fclean:
	docker stop $$(docker ps -qa)
	docker rm $$(docker ps -qa)
	docker rmi -f $$(docker images -qa)
	docker volume rm $$(docker volume ls -q)
	find $(PWD)/data/db -mindepth 1 -delete
	find $(PWD)/data/web -mindepth 1 -delete
	docker network rm $$(docker network ls -q) 2>/dev/null || true

re: fclean all

up:
	docker-compose -f $(PWD)/docker-compose.yml up -d

down:
	docker-compose -f $(PWD)/docker-compose.yml down

start:
	docker-compose -f $(PWD)/docker-compose.yml start

stop:
	docker-compose -f $(PWD)/docker-compose.yml stop

restart:
	docker-compose -f $(PWD)/docker-compose.yml restart
	
.PHONY: all clean fclean re up down restart