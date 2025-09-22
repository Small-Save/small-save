# myapp/middleware.py
from django.utils import timezone

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
            timezone.activate("UTC")

        response = self.get_response(request)

        timezone.deactivate()

        return response
