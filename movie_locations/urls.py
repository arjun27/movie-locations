from django.conf.urls import url

from . import views

app_name = "movie_locations"
urlpatterns = [
    url(r'^$', views.index, name='index'),
]