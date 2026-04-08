from __future__ import annotations

import logging
from enum import Enum

from django.core.validators import MinValueValidator
from django.db import models, transaction
from django.utils import timezone

from Groups.models import Group, GroupMember
from Payment.constants import PaymentStatus
from Payment.models import Payment

logger = logging.getLogger(__name__)


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

    group = models.ForeignKey(
        Group, on_delete=models.CASCADE, related_name="bidding_rounds"
    )
    round_number = models.IntegerField()
    scheduled_time = models.DateTimeField()
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=BiddingRoundStatusEnum.SCHEDULED.value,
    )
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
        constraints = [
            models.UniqueConstraint(
                fields=["group", "round_number"], name="unique_biding_round"
            )
        ]
        ordering = ["scheduled_time"]

    def __str__(self):
        return f"{self.group.name} - Round {self.round_number}"

    def can_start(self):
        return (
            self.status == BiddingRoundStatusEnum.SCHEDULED.value
            and timezone.now() >= self.scheduled_time
        )

    def is_active(self):
        return self.status == BiddingRoundStatusEnum.ACTIVE.value

    def get_winning_bid(self) -> Bid | None:
        return self.bids.filter(is_valid=True).order_by("amount", "timestamp").first()

    def start_bidding(self):
        if self.can_start():
            self.status = BiddingRoundStatusEnum.ACTIVE.value
            self.start_time = timezone.now()
            self.save()
            logger.info(
                "Bidding round started: round_id=%s group_id=%s", self.pk, self.group_id
            )
            return True
        logger.warning(
            "Cannot start bidding: round_id=%s status=%s", self.pk, self.status
        )
        return False

    def end_bidding(self) -> bool:
        if not self.is_active():
            logger.warning(
                "Cannot end bidding: round_id=%s is not active (status=%s)",
                self.pk,
                self.status,
            )
            return False

        with transaction.atomic():
            winning_bid = self.get_winning_bid()

            if not winning_bid:
                random_winner = (
                    GroupMember.objects.filter(group=self.group, has_won=False)
                    .order_by("?")
                    .first()
                )
                if not random_winner:
                    logger.warning(
                        "No eligible members for random winner: round_id=%s group_id=%s",
                        self.pk,
                        self.group_id,
                    )
                    return False
                winning_bid = Bid.objects.create(
                    bidding_round=self,
                    member=random_winner,
                    amount=self.group.target_amount,
                )
                logger.info(
                    "No bids placed, random winner selected: round_id=%s member_id=%s",
                    self.pk,
                    random_winner.pk,
                )

            self.status = BiddingRoundStatusEnum.COMPLETED.value
            self.end_time = timezone.now()
            self.winner = winning_bid.member
            self.winning_bid = winning_bid
            self.save()
            GroupMember.objects.filter(pk=winning_bid.member_id).update(has_won=True)

            payments = [
                Payment(
                    group_id=self.group.id,
                    round_id=self.id,
                    giver_id=gm.user_id,
                    receiver_id=winning_bid.member.user_id,
                    amount=winning_bid.amount,
                    status=PaymentStatus.PENDING,
                )
                for gm in self.group.groupmember_set.all()
                if gm.user_id != winning_bid.member.user_id
            ]

            Payment.objects.bulk_create(payments)

        logger.info(
            "Bidding round completed: round_id=%s winner_member_id=%s winning_amount=%s",
            self.pk,
            winning_bid.member_id,
            winning_bid.amount,
        )

        self._send_end_notifications(winning_bid)
        return True

    def _send_end_notifications(self, winning_bid):
        from Notifications.models import NotifType
        from Notifications.services import notify_user

        notif_data = {"group_id": self.group_id, "round_id": self.pk}

        notify_user(
            user=winning_bid.member.user,
            notification_type=NotifType.BIDDING_WON,
            title="You won the bid!",
            body=f"Congratulations! You won Round {self.round_number} in {self.group.name}.",
            data=notif_data,
        )

        other_members = (
            self.group.groupmember_set.select_related("user")
            .exclude(user_id=winning_bid.member.user_id)
        )
        for gm in other_members:
            notify_user(
                user=gm.user,
                notification_type=NotifType.PAYMENT_DUE,
                title="Payment due",
                body=f"Round {self.round_number} in {self.group.name} ended. Your payment is due.",
                data=notif_data,
            )


class Bid(models.Model):
    bidding_round = models.ForeignKey(
        BiddingRound, on_delete=models.CASCADE, related_name="bids"
    )
    member = models.ForeignKey(GroupMember, on_delete=models.CASCADE)
    amount = models.PositiveIntegerField(validators=[MinValueValidator(0)])
    timestamp = models.DateTimeField(auto_now_add=True)
    is_valid = models.BooleanField(default=True)

    class Meta:
        ordering = ["-amount", "timestamp"]
        constraints = [
            models.UniqueConstraint(
                fields=["bidding_round", "amount"], name="unique_bid_per_round"
            )
        ]

    def __str__(self):
        return f"timestamp: {self.timestamp} - user: {self.member.user.username} - amount: ₹{self.amount}"
