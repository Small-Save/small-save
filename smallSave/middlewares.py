import logging

from django.utils import timezone

logger = logging.getLogger(__name__)


class TimezoneMiddleware:
    """
    Sets timezone per request based on user's timezone.
    Falls back to UTC if not available.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        tzname = request.headers.get("X-Timezone", "UTC")
        try:
            timezone.activate(tzname)
        except Exception:
            logger.warning(
                "Invalid timezone '%s' from %s %s, falling back to UTC",
                tzname,
                request.method,
                request.path,
            )
            timezone.activate("UTC")

        response = self.get_response(request)

        timezone.deactivate()

        return response
