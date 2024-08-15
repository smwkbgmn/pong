set -e

python manage.py migrate --settings=source.settings.prod
exec python manage.py runserver 0.0.0.0:8000 --settings=source.settings.prod
