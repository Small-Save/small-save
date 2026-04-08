from django.urls import path

from . import views

urlpatterns = [
    path("", views.list_notifications, name="list-notifications"),
    path("unread-count/", views.unread_count, name="unread-count"),
    path("<int:notification_id>/read/", views.mark_as_read, name="mark-as-read"),
    path("read-all/", views.mark_all_as_read, name="mark-all-as-read"),
]
