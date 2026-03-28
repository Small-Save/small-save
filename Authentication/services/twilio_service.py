import random

from django.conf import settings
from twilio.rest import Client


def send_otp(phone_number):
    otp = str(random.randint(100000, 999999))
    client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

    client.messages.create(body=f"Your otp is {otp}", from_=settings.TWILIO_PHONE_NUMBER, to=phone_number)
    return otp
