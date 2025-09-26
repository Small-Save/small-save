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
        fields = ("user",)


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


class GroupCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = (
            "name",
            "target_amount",
            "size",
            "duration",
            "winner_selection_method",
            "start_date",
            "members",
        )
        choices = Group.WINNER_SELECTION_CHOICES

    # members are passed as user IDs (integers)
    member_ids = serializers.ListField(
        child=serializers.UUIDField(),
        allow_empty=False,
        help_text="List of user UUIDs to add as members (length must equal `size`).",
    )

    # TODO: add validations based on size and duration(size should be related to duration)
    def validate_start_date(self, value):
        # TODO may need to add validation based on usecase
        today = timezone.localdate()
        if value < today:
            raise serializers.ValidationError("start_date cannot be in the past.")
        return value

    def validate(self, data):
        request = self.context.get("request")
        creator = getattr(request, "user", None)

        member_ids = data.get("member_ids") or []
        size = data.get("size")
        target_amount = data.get("target_amount")

        if target_amount is not None and size is not None:
            if target_amount % size != 0:
                raise serializers.ValidationError(
                    {"target_amount": "target_amount should be a multiple of size."}
                )

        if len(set(member_ids)) != len(member_ids):
            raise serializers.ValidationError(
                {"member_ids": "Duplicate user IDs are not allowed."}
            )
        # Ensure creator is part of final list (append if absent)
        final_ids = list(member_ids)
        if creator.id not in final_ids:
            final_ids.append(creator.id)

        if len(member_ids) != size:
            raise serializers.ValidationError(
                {
                    "size": "size must equal the number of distinct member IDs plus the creator (auto-added if missing)."
                }
            )

        data["member_ids"] = final_ids
        # tODO: also need to add validation so that each member can be involved in a at max 2 group at a time.
        return data

    def create(self, validated_data):
        # View handles creation under transaction; serializer.create not used.
        raise NotImplementedError(
            "GroupCreateSerializer.create should not be called directly."
        )


class GroupUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = (
            "name",
            "target_amount",
            "size",
            "duration",
            "winner_selection_method",
            "start_date",
        )

    # TODO: add some higher limit to target_amount
    def validate_start_date(self, value):
        # Provided start_date must not be in the past
        today = timezone.localdate()
        if value < today:
            raise serializers.ValidationError("start_date cannot be in the past.")
        return value

    def validate(self, data):
        # Prevent updates to groups that have already started (start_date <= today)
        if self.instance:
            today = timezone.localdate()
            if self.instance.start_date <= today:
                raise serializers.ValidationError(
                    {"start_date": "Group cannot be updated once the group is started."}
                )

        if data.get("size") < self.instance.members.count():
            raise serializers.ValidationError(
                {
                    "size": "size must be greater than or equal to the number of existing members."
                }
            )

        target_amount = data.get("target_amount") or self.instance.target_amount
        size = data.get("size") or self.instance.size

        if target_amount is not None and size is not None:
            if target_amount % size != 0:
                raise serializers.ValidationError(
                    {"target_amount": "target_amount should be a multiple of size."}
                )

        return data
