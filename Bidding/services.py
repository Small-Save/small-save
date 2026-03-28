import logging
from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

from dateutil.relativedelta import relativedelta

from Bidding.models import BiddingRound, BiddingRoundStatusEnum
from Groups.models import Group

logger = logging.getLogger(__name__)


def create_bidding_rounds(request, group: Group):
    tz_name = request.headers.get("X-Timezone", "Asia/Kolkata")
    logger.info(
        "Creating %d bidding rounds for group_id=%s (tz=%s)",
        group.duration,
        group.id,
        tz_name,
    )

    for i in range(1, group.duration + 1):
        scheduled_date = group.start_date + relativedelta(months=i)
        start_time = datetime.combine(
            scheduled_date.date()
            if hasattr(scheduled_date, "date")
            else scheduled_date,
            time(0, 0, 0),
            tzinfo=ZoneInfo(tz_name),  # TODO: test this
        )
        end_time = start_time + timedelta(days=1)
        BiddingRound.objects.create(
            group=group,
            round_number=i,
            scheduled_time=scheduled_date,
            start_time=start_time,
            end_time=end_time,
            status=BiddingRoundStatusEnum.SCHEDULED.value,
        )

    logger.info("Created %d bidding rounds for group_id=%s", group.duration, group.id)
