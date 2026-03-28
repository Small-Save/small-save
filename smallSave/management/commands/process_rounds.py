from django.core.management.base import BaseCommand
from django.utils import timezone

from Bidding.models import BiddingRound, BiddingRoundStatusEnum


class Command(BaseCommand):
    help = "Process bidding rounds"

    def handle(self, *args, **kwargs):
        now = timezone.now()

        self.start_scheduled_rounds(now)
        self.complete_expired_rounds(now)

    def start_scheduled_rounds(self, now):
        scheduled_rounds = BiddingRound.objects.filter(
            status=BiddingRoundStatusEnum.SCHEDULED.value,
            scheduled_time__lte=now,
        )
        for bidding_round in scheduled_rounds:
            bidding_round.start_bidding()
            self.stdout.write(self.style.SUCCESS(f"Started bidding for {bidding_round}"))

    def complete_expired_rounds(self, now):
        active_rounds = BiddingRound.objects.filter(
            status=BiddingRoundStatusEnum.ACTIVE.value,
            end_time__lte=now,
        )
        for bidding_round in active_rounds:
            bidding_round.end_bidding()
            self.stdout.write(self.style.SUCCESS(f"Completed bidding for {bidding_round}"))
