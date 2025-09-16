# urls.py (example integration)
from django.urls import path
from .views import GroupCreateAPIView

urlpatterns = [
    path('create/', GroupCreateAPIView.as_view(), name='group-create'),
]