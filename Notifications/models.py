from django.conf import settings
from django.db import models


class NotifType:
    BIDDING_STARTED = "bidding_started"
    BIDDING_ENDED = "bidding_ended"
    BIDDING_WON = "bidding_won"
    PAYMENT_DUE = "payment_due"
    PAYMENT_CONFIRMED = "payment_confirmed"


class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    notification_type = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    body = models.TextField()
    data = models.JSONField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "notifications"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user", "-created_at"]),
            models.Index(fields=["user", "is_read"]),
        ]

    def __str__(self):
        return f"[{self.notification_type}] {self.title} → {self.user_id}"
