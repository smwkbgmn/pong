from django.urls import path

from .views import *


urlpatterns = [
	path('login/', FourtyTwoLoginView.as_view()),
    path('login/callback/', FourtyTwoCallbackView.as_view()),
]