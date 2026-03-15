# payments/models.py
from django.db import models
from django.conf import settings
from .constants import PaymentStatus
from Groups.models import Group

User = settings.AUTH_USER_MODEL

class Payment(models.Model):
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    round = models.ForeignKey("Bidding.BiddingRound", on_delete=models.CASCADE)

    giver = models.ForeignKey(
        User, related_name="payments_given", on_delete=models.CASCADE
    )
    receiver = models.ForeignKey(
        User, related_name="payments_received", on_delete=models.CASCADE
    )

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("group", "round", "giver")

    def __str__(self):
        return f"{self.giver} → {self.receiver} ({self.status})"
