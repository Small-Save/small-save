from datetime import datetime
from datetime import time
from datetime import timedelta
from zoneinfo import ZoneInfo

from dateutil.relativedelta import relativedelta
from Groups.models import Group

from Bidding.models import BiddingRound
from Bidding.models import BiddingRoundStatusEnum


def create_bidding_rounds(request, group: Group):
    for i in range(1, group.duration + 1):
        scheduled_date = group.start_date + relativedelta(months=i)
        start_time = datetime.combine(
            scheduled_date.date() if hasattr(scheduled_date, "date") else scheduled_date,
            time(0, 0, 0),  # 12am (midnight)
            tzinfo=ZoneInfo(request.headers.get("X-Timezone", "Asia/Kolkata")),  # TODO: test this
        )
        # End time is exactly 1 day after start time
        end_time = start_time + timedelta(days=1)
        BiddingRound.objects.create(
            group=group,
            round_number=i,
            scheduled_time=scheduled_date,
            start_time=start_time,
            end_time=end_time,
            status=BiddingRoundStatusEnum.SCHEDULED.value,
        )
