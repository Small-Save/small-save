# urls.py (example integration)
from django.urls import path
from Groups.views import GroupCreateAPIView, UserGroupListAPIView, verify_contacts

urlpatterns = [
    path("create/", GroupCreateAPIView.as_view(), name="group-create"),
    path("", UserGroupListAPIView.as_view(), name="user-groups"),
    path("verify-contacts/", verify_contacts, name="verify-contacts")
]
