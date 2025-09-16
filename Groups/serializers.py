# serializers.py
from rest_framework import serializers
from .models import Group, GroupMember
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class UserLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username")


class GroupMemberSerializer(serializers.ModelSerializer):
    user = UserLiteSerializer(read_only=True)

    class Meta:
        model = GroupMember
        fields = ("user", "joined_at")


class GroupReadSerializer(serializers.ModelSerializer):
    members = GroupMemberSerializer(source="groupmember_set", many=True, read_only=True)

    class Meta:
        model = Group
        fields = (
            "id",
            "name",
            "target_amount",
            "size",
            "duration",
            "winner_selection_method",
            "start_date",
            "created_at",
            "members",
        )


class GroupCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    target_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    size = serializers.IntegerField(min_value=1)
    duration = serializers.IntegerField(min_value=1)
    winner_selection_method = serializers.ChoiceField(choices=Group.WINNER_SELECTION_CHOICES)
    start_date = serializers.DateField()
    # members are passed as user IDs (integers)
    member_ids = serializers.ListField(
        child=serializers.UUIDField(),
        allow_empty=False,
        help_text="List of user UUIDs to add as members (length must equal `size`)."
    )

    def validate_start_date(self, value):
        # TODO may need to add validation based on usecase
        today = timezone.localdate()
        if value < today:
            raise serializers.ValidationError("start_date cannot be in the past.")
        return value

    def validate(self, data):
        member_ids = data.get("member_ids") or []
        size = data.get("size")
        if len(member_ids) != size:
            raise serializers.ValidationError({
                "member_ids": "The number of member IDs provided must equal `size`."
            })
        if len(set(member_ids)) != len(member_ids):
            raise serializers.ValidationError({"member_ids": "Duplicate user IDs are not allowed."})
        # tODO: also need to add validation so that each member can be involved in a at max 2 group at a time.
        return data

    def create(self, validated_data):
        # View handles creation under transaction; serializer.create not used.
        raise NotImplementedError("GroupCreateSerializer.create should not be called directly.")
