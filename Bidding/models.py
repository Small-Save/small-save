from __future__ import annotations

from enum import Enum

from django.core.validators import MinValueValidator
from django.db import models
from django.db import transaction
from django.utils import timezone
from Groups.models import Group
from Groups.models import GroupMember


class BiddingRoundStatusEnum(Enum):
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLLED = "cancelled"


class BiddingRound(models.Model):
    STATUS_CHOICES = [
        ("scheduled", "Scheduled"),
        ("active", "Active"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name="bidding_rounds")
    round_number = models.IntegerField()
    scheduled_time = models.DateTimeField()
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=BiddingRoundStatusEnum.SCHEDULED.value)
    winner = models.ForeignKey(
        GroupMember,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="won_rounds",
    )
    winning_bid = models.ForeignKey(
        "Bid",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="winning_rounds",
    )

    class Meta:
        db_table = "BiddingRound"
        constraints = [models.UniqueConstraint(fields=["group", "round_number"], name="unique_biding_round")]
        ordering = ["scheduled_time"]

    def __str__(self):
        return f"{self.group.name} - Round {self.round_number}"

    def can_start(self):
        return self.status == BiddingRoundStatusEnum.SCHEDULED.value and timezone.now() >= self.scheduled_time

    def is_active(self):
        return self.status == BiddingRoundStatusEnum.ACTIVE.value

    def get_winning_bid(self) -> Bid | None:
        return self.bids.filter(is_valid=True).order_by("amount", "timestamp").first()

    def start_bidding(self):
        if self.can_start():
            self.status = BiddingRoundStatusEnum.ACTIVE.value
            self.start_time = timezone.now()
            self.save()
            return True
        return False

    def end_bidding(self) -> bool:
        with transaction.atomic():
            winning_bid = self.get_winning_bid()
            if not winning_bid:
                random_winner = self.group.members.filter(has_won=False).order_by("?").first()
                winning_bid = Bid.objects.create(
                    bidding_round=self,
                    member=random_winner,
                    amount=self.group.target_amount,
                )
            self.status = BiddingRoundStatusEnum.COMPLETED.value
            self.end_time = timezone.now()
            self.winner = winning_bid.member
            self.winning_bid = winning_bid
            self.save()
        # TODO: send notification to the winner
        # TODO: send notification to the group members
        return True


class Bid(models.Model):
    bidding_round = models.ForeignKey(BiddingRound, on_delete=models.CASCADE, related_name="bids")
    member = models.ForeignKey(GroupMember, on_delete=models.CASCADE)
    amount = models.PositiveIntegerField(validators=[MinValueValidator(0)])
    timestamp = models.DateTimeField(auto_now_add=True)
    is_valid = models.BooleanField(default=True)

    class Meta:
        ordering = ["-amount", "timestamp"]
        constraints = [models.UniqueConstraint(fields=["bidding_round", "amount"], name="unique_bid_per_round")]

    def __str__(self):
        return f"timestamp: {self.timestamp} - user: {self.member.user.username} - amount: ₹{self.amount}"
