# payments/serializers.py
from rest_framework import serializers

from Authentication.serializers import BaseUserSerializer

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    round_number = serializers.IntegerField(source="round.round_number")
    giver = BaseUserSerializer(read_only=True)
    receiver = BaseUserSerializer(read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "round_number",
            "giver",
            "receiver",
            "amount",
            "status",
            "created_at",
        ]
        read_only_fields = ("status",)
