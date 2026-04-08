from django.contrib import admin

from .models import Notification


# TODO: probably not needed
@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "notification_type", "title", "is_read", "created_at")
    list_filter = ("notification_type", "is_read")
    search_fields = ("title", "body")
    readonly_fields = ("created_at",)
