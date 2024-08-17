FROM postgres:latest

COPY ./tools/sql/init-db.sql /docker-entrypoint-initdb.d/

RUN echo "alias psql_conn='psql -h \$POSTGRES_HOST -U \$POSTGRES_USER -d \$POSTGRES_DB -p \$POSTGRES_PORT'" >> ~/.bashrc

HEALTHCHECK --interval=2s \
			--timeout=10s \
			--retries=5 \
			--start-period=30s \
			CMD psql -U $POSTGRES_USER \
					-lqt \
				| cut -d \| -f 1 \
				| grep -qw $POSTGRES_DB \
				|| exit 1