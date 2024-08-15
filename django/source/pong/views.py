from django.shortcuts import render
from django.http import HttpResponse

def index(request):
    return render(request, 'pong/index.html')

def game(request):
    return render(request, 'pong/game.html')

# def game(request):
# 	room_id = request.GET.get('roomId')
# 	return render(request, 'pong/game.html', {'room_id': room_id})