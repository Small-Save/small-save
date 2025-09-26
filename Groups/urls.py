# urls.py (example integration)
from django.urls import path
from .views import GroupCreateAPIView, UserGroupListAPIView

urlpatterns = [
    path("create/", GroupCreateAPIView.as_view(), name="group-create"),
    path("", UserGroupListAPIView.as_view(), name="user-groups"),
]
