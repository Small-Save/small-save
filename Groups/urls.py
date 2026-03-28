# urls.py (example integration)
from django.conf import settings
from django.urls import path

from Groups.views import (
    GroupCreateAPIView,
    UserGroupListAPIView,
    UserGroupRetrieveAPIView,
    create_bidding_round,
    verify_contacts,
)

urlpatterns = [
    path("<int:id>/", UserGroupRetrieveAPIView.as_view(), name="group-detail"),
    path("create/", GroupCreateAPIView.as_view(), name="group-create"),
    path("", UserGroupListAPIView.as_view(), name="user-groups"),
    path("verify-contacts/", verify_contacts, name="verify-contacts"),
]

if settings.DEBUG:
    urlpatterns += [
        path(
            "<int:group_id>/rounds/create/",
            create_bidding_round,
            name="create_round",
        ),
    ]
