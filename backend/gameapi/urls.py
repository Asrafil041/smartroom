from django.urls import path
from . import views

urlpatterns = [
    path('score/', views.score, name='score'),
]