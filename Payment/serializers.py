# payments/serializers.py
from rest_framework import serializers
from .models import Payment
from django.contrib.auth import get_user_model
from Groups.models import Group
from Bidding.models import BiddingRound

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
            "created_at"
        ]


class InitiatePaymentSerializer(serializers.Serializer):
    group_id = serializers.IntegerField()
    round_id = serializers.IntegerField()
    receiver_id = serializers.UUIDField()

    def validate(self, attrs):
        group_id = attrs["group_id"]
        round_id = attrs["round_id"]
        receiver_id = attrs["receiver_id"]
        
        if not Group.objects.filter(id = group_id).exists():
            raise serializers.ValidationError("Invalid group")
        
        if not BiddingRound.objects.filter( id = round_id).exists():
            raise serializers.ValidationError("Round Does not exist")

        group = Group.objects.prefetch_related("members").get(id = group_id )

        if receiver_id not in group.members.values_list("id", flat=True):
            raise serializers.ValidationError("Receiver must be a member of the group")
            
        return attrs
    



class PaymentDetailSerializer(serializers.ModelSerializer):
    # Use 'source' to traverse the relationships and pull out specific fields
    group_name = serializers.CharField(source='group.name', read_only=True)
    giver_name = serializers.CharField(source='giver.username', read_only=True)
    receiver_name = serializers.CharField(source='receiver.username', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'group_id', 
            'group_name',
            'giver_id', 
            'giver_name',
            'receiver_id', 
            'receiver_name',
            'amount', 
            'status'
        ]