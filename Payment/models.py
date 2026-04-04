# payments/models.py
from django.conf import settings
from django.db import models

from Groups.models import Group

from .constants import PaymentStatus

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
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("group", "round", "giver")

    def __str__(self):
        return f"{self.giver} → {self.receiver} ({self.status})"

    @property
    def is_pending(self):
        return self.status == PaymentStatus.PENDING

    @property
    def is_giver_confirmed(self):
        return self.status == PaymentStatus.GIVER_CONFIRMED

    @property
    def is_completed(self):
        return self.status == PaymentStatus.COMPLETED

    def mark_giver_confirmed(self):
        if self.status != PaymentStatus.PENDING:
            raise ValueError(
                f"Cannot confirm payment in '{self.status}' state; must be PENDING."
            )
        self.status = PaymentStatus.GIVER_CONFIRMED
        self.save(update_fields=["status", "updated_at"])

    def mark_completed(self):
        if self.status != PaymentStatus.GIVER_CONFIRMED:
            raise ValueError(
                f"Cannot complete payment in '{self.status}' state; must be GIVER_CONFIRMED."
            )
        self.status = PaymentStatus.COMPLETED
        self.save(update_fields=["status", "updated_at"])
