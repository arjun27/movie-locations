from django.shortcuts import render

def index(request):
    return render(request, 'movie_locations/index.html')
