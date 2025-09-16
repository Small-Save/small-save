# views.py
from rest_framework import generics, status
from Groups.models import Group, GroupMember
from Groups.serializers import GroupCreateSerializer, GroupReadSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db import IntegrityError, transaction
from django.contrib.auth import get_user_model

from utils.exceptions import BadRequestError, ConflictError
from utils.response import CustomResponse

import logging

logger = logging.getLogger(__name__)
User = get_user_model()


class GroupCreateAPIView(generics.CreateAPIView):
    """
    API endpoint to create a group with members.
    - Validates user IDs
    - Creates Group atomically
    - Bulk inserts GroupMember rows
    """

    serializer_class = GroupCreateSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        logger.info(
            "Request to create group: name=%s size=%s start_date=%s",
            data["name"],
            data["size"],
            data["start_date"],
        )

        member_ids = data["member_ids"]

        users_qs = User.objects.filter(id__in=member_ids)
        users = list(users_qs)

        # Validate missing IDs
        if len(users) != len(set(member_ids)):
            found_ids = {u.id for u in users}
            missing = [str(uid) for uid in member_ids if uid not in found_ids]
            logger.warning("Missing user IDs while creating group: %s", missing)
            raise BadRequestError(f"Some user ids were not found: {', '.join(missing)}")

        try:
            with transaction.atomic():
                group = Group.objects.create(
                    name=data["name"],
                    target_amount=data["target_amount"],
                    size=data["size"],
                    duration=data["duration"],
                    winner_selection_method=data["winner_selection_method"],
                    start_date=data["start_date"],
                    created_by=request.user,
                )

                # Prepare and bulk create members
                gm_instances = [
                    GroupMember(group=group, user=user, role="admin")
                    if user == request.user
                    else GroupMember(group=group, user=user)
                    for user in users
                ]
                GroupMember.objects.bulk_create(gm_instances)

                group.refresh_from_db()  # reload with members
                logger.info(
                    "Group created successfully: group_id=%s with %d members",
                    group.pk,
                    len(users),
                )

                read_serializer = GroupReadSerializer(group)

                return CustomResponse(
                    data=read_serializer.data,
                    status_code=status.HTTP_201_CREATED,
                    message="Group created successfully",
                    toast_message="Group created 🎉",
                )
        except IntegrityError as exc:
            logger.exception("Integrity error creating group or members: %s", exc)
            raise ConflictError(
                "Database integrity error while creating group/members."
            )
        except Exception as exc:
            logger.exception("Unexpected error creating group: %s", exc)
            raise
