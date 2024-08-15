from django.urls import re_path
from . import consumer

websocket_urlpatterns = [
    re_path(r'ws/pong$', consumer.Consumer.as_asgi()),
]