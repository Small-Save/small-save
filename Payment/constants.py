# payments/constants.py
from django.db import models

class PaymentStatus(models.TextChoices):
    PENDING = "PENDING", "Pending"
    GIVER_CONFIRMED = "GIVER_CONFIRMED", "Giver Confirmed"
    COMPLETED = "COMPLETED", "Completed"
