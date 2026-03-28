import logging
import random

from django.conf import settings
from twilio.rest import Client

logger = logging.getLogger(__name__)


def send_otp(phone_number):
    otp = str(random.randint(100000, 999999))
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

    try:
        client.messages.create(
            body=f"Your otp is {otp}",
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone_number,
        )
        logger.info("OTP SMS sent to phone=%s via Twilio", phone_number)
    except Exception:
        logger.exception("Failed to send OTP SMS to phone=%s via Twilio", phone_number)
        raise

    return otp
