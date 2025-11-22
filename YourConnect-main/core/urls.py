from django.urls import path
from .views import (
    ProfileEditAPI,
)

urlpatterns = [
    path('user/profile/edit/', ProfileEditAPI.as_view(), name='profile_edit_api'),
]
