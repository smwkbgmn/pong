FROM postgres:latest

COPY ./tools/sql/init-db.sql /docker-entrypoint-initdb.d/

HEALTHCHECK --interval=2s \
			--timeout=10s \
			--retries=5 \
			--start-period=30s \
			CMD psql -U $POSTGRES_USER \
					-lqt \
				| cut -d \| -f 1 \
				| grep -qw $POSTGRES_DB \
				|| exit 1