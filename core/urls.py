from django.urls import path
from .views import get_user_jobs

urlpatterns = [
    path("jobs/<str:username>/", get_user_jobs, name="user_jobs"),
]


