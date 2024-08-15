FROM python:3

RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		postgresql-client \
	&& rm -rf /var/lib/apt/lists/*

COPY ./requirements/requirements_prod.txt ./requirements.txt
RUN pip install --no-cache-dir -r ./requirements.txt

COPY ./source /source

WORKDIR /source

COPY ./docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

EXPOSE 8000

CMD [ "sh", "/docker-entrypoint.sh" ]
