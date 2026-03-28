# payments/serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = ("status",)


User = get_user_model()


class PaymentStatusSerializer(serializers.ModelSerializer):
    giver_name = serializers.CharField(source="giver.username", read_only=True)
    receiver_name = serializers.CharField(source="receiver.username", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "id",
            "giver",
            "giver_name",
            "receiver",
            "receiver_name",
            "amount",
            "status",
            "created_at",
        ]


class PaymentDetailSerializer(serializers.ModelSerializer):
    # Use 'source' to traverse the relationships and pull out specific fields
    group_name = serializers.CharField(source="group.name", read_only=True)
    giver_name = serializers.CharField(source="giver.username", read_only=True)
    receiver_name = serializers.CharField(source="receiver.username", read_only=True)

    class Meta:
        model = Payment
        fields = [
            "group_id",
            "group_name",
            "giver_id",
            "giver_name",
            "receiver_id",
            "receiver_name",
            "amount",
            "status",
        ]
