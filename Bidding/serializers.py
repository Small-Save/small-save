from Authentication.serializers import BaseUserSerializer
from django.utils import timezone
from rest_framework import serializers

from Bidding.models import Bid
from Bidding.models import BiddingRound


class BiddingRoundSerializer(serializers.ModelSerializer):
    winner_username = serializers.CharField(source="winner.user.username", read_only=True)
    total_bids = serializers.SerializerMethodField()

    class Meta:
        model = BiddingRound
        fields = [
            "id",
            "group",
            "round_number",
            "scheduled_time",
            "start_time",
            "end_time",
            "status",
            "winner",
            "winner_username",
            "winning_bid",
            "total_bids",
        ]
        read_only_fields = ["id", "start_time", "end_time", "winner", "winning_bid"]

    def get_total_bids(self, obj):
        return obj.bids.filter(is_valid=True).count()


class CreateBiddingRoundSerializer(serializers.ModelSerializer):
    """Serializer for creating a new bidding round"""

    class Meta:
        model = BiddingRound
        fields = ["round_number", "scheduled_time"]

    # TODO: May need to add more validations

    def validate_round_number(self, value):
        group = self.context.get("group")
        if BiddingRound.objects.filter(group=group, round_number=value).exists():
            msg = f"Round {value} already exists for this group"
            raise serializers.ValidationError(msg)
        return value

    def validate_scheduled_time(self, value):
        # TODO:add more vallidations
        if value < timezone.now():
            msg = "Scheduled time must be in the future"
            raise serializers.ValidationError(msg)
        return value


class BidSerializer(serializers.ModelSerializer):
    # TODO: redduce few detail which are coming from the member details
    member = BaseUserSerializer(source="member.user", read_only=True)

    class Meta:
        model = Bid
        fields = [
            "id",
            "bidding_round",
            "member",
            "amount",
            "timestamp",
            "is_valid",
        ]
        read_only_fields = ["id", "timestamp", "is_valid"]
