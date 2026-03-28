import logging

from django.core.management.base import BaseCommand
from django.utils import timezone

from Bidding.models import BiddingRound, BiddingRoundStatusEnum

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Process bidding rounds"

    def handle(self, *args, **kwargs):
        now = timezone.now()
        logger.info("process_rounds started at %s", now)

        started = self.start_scheduled_rounds(now)
        completed = self.complete_expired_rounds(now)

        logger.info("process_rounds finished: %d started, %d completed", started, completed)

    def start_scheduled_rounds(self, now):
        scheduled_rounds = BiddingRound.objects.filter(
            status=BiddingRoundStatusEnum.SCHEDULED.value,
            scheduled_time__lte=now,
        )
        count = 0
        for bidding_round in scheduled_rounds:
            if bidding_round.start_bidding():
                count += 1
                logger.info("Started bidding: round_id=%s group_id=%s", bidding_round.pk, bidding_round.group_id)
            else:
                logger.warning("Failed to start bidding: round_id=%s", bidding_round.pk)
        return count

    def complete_expired_rounds(self, now):
        active_rounds = BiddingRound.objects.filter(
            status=BiddingRoundStatusEnum.ACTIVE.value,
            end_time__lte=now,
        )
        count = 0
        for bidding_round in active_rounds:
            if bidding_round.end_bidding():
                count += 1
                logger.info("Completed bidding: round_id=%s group_id=%s", bidding_round.pk, bidding_round.group_id)
            else:
                logger.warning("Failed to complete bidding: round_id=%s", bidding_round.pk)
        return count
