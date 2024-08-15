from django.urls import path

from .views import *


urlpatterns = [
    path('login/callback/', FourtyTwoCallbackView.as_view()),
]
