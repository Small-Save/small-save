# views.py
from rest_framework import generics, status
from Groups.models import Group, GroupMember
from Groups.serializers import (
    GroupCreateSerializer,
    GroupReadSerializer,
    GroupUpdateSerializer,
)
from Authentication.serializers import BaseUserSerializer
from Groups.permissions import IsGroupAdmin
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db import IntegrityError, transaction
from django.contrib.auth import get_user_model

from utils.exceptions import BadRequestError, ConflictError
from utils.response import CustomResponse
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)

from django.core.exceptions import ValidationError
from Groups.services import validate_contact_data

import logging

logger = logging.getLogger("api")
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


class UserGroupListAPIView(generics.ListAPIView):
    """
    Lists all groups the authenticated user is a member of.
    Optional query param: ?simple=true for a lighter serializer.
    """

    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = GroupReadSerializer

    def get_queryset(self):
        return (
            Group.objects.filter(groupmember__user=self.request.user)
            .distinct()
            .select_related("created_by")
            .prefetch_related("groupmember_set__user")
            .order_by("-created_at")
        )

    def list(self, request, *args, **kwargs):
        logger.info("UserGroupListAPIView called by user_id=%s", request.user.id)
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(
            page if page is not None else queryset, many=True
        )
        logger.info(
            "UserGroupListAPIView success user_id=%s groups_returned=%d",
            request.user.id,
            len(serializer.data),
        )

        response = CustomResponse(
            data=serializer.data,
            status_code=status.HTTP_200_OK,
            message="Groups fetched",
        )
        return response


class GroupUpdateAPIView(generics.UpdateAPIView):
    """
    Admin-only update of a group.
    Allowed fields: name, target_amount, duration, winner_selection_method, start_date.
    """

    queryset = Group.objects.all().select_related("created_by")
    serializer_class = GroupUpdateSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, IsGroupAdmin]
    lookup_url_kwarg = "group_id"
    lookup_field = "id"

    def update(self, request, *args, **kwargs):
        partial = kwargs.get("partial", False)
        group = self.get_object()
        serializer = self.get_serializer(group, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                serializer.save()
                logger.info(
                    "Group updated: group_id=%s by user_id=%s fields=%s",
                    group.id,
                    request.user.id,
                    list(serializer.validated_data.keys()),
                )
        except IntegrityError as exc:
            logger.exception("Integrity error updating group: %s", exc)
            raise ConflictError("Could not update group due to integrity error.")
        except Exception as exc:
            logger.exception("Unexpected error updating group: %s", exc)
            raise

        refreshed = (
            Group.objects.select_related("created_by")
            .prefetch_related("groupmember_set__user")
            .get(id=group.id)
        )
        read_data = GroupReadSerializer(refreshed).data
        return CustomResponse(
            data=read_data,
            status_code=status.HTTP_200_OK,
            message="Group updated successfully",
            toast_message="Group updated ✅",
        )


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def verify_contacts(request):
    logger.info(
        "verify_contacts called by user_id=%s with %d contacts",
        request.user.id,
        len(request.data.get("contacts", [])),
    )

    try:
        contacts = request.data.get("contacts", [])

        if not isinstance(contacts, list):
            raise BadRequestError("'contacts' must be a list")

        if not contacts:
            return CustomResponse(
                data={
                    "existing_users": [],
                    "invite_needed": [],
                    "invalid_contacts": [],
                },
                message="No contacts provided",
            )

        # Validate and normalize all contacts
        valid_contacts = []
        invalid_contacts = []

        for i, contact in enumerate(contacts):
            try:
                validated_contact = validate_contact_data(contact)
                valid_contacts.append(validated_contact)
            except ValidationError as e:
                invalid_contacts.append(
                    {"contact": contact, "errors": [str(e)], "index": i}
                )
                logger.warning(
                    "Invalid contact at index %d from user_id=%s: %s",
                    i,
                    request.user.id,
                    str(e),
                )

        if not valid_contacts:
            return CustomResponse(
                data={
                    "existing_users": [],
                    "invite_needed": [],
                    "invalid_contacts": invalid_contacts,
                },
                message="No valid contacts provided",
            )

        # Collect all phones and emails for bulk query
        phones = [c["phone"] for c in valid_contacts if "phone" in c]
        emails = [c["email"] for c in valid_contacts if "email" in c]

        # Bulk query for existing users
        existing_users_qs = User.objects.none()

        if phones:
            existing_users_qs = existing_users_qs.union(
                User.objects.filter(phone_number__in=phones)
                .select_related()
                .only("id", "phone_number", "email", "first_name", "last_name")
            )

        if emails:
            existing_users_qs = existing_users_qs.union(
                User.objects.filter(email__in=emails)
                .select_related()
                .only("id", "phone_number", "email", "first_name", "last_name")
            )

        existing_users_list = list(existing_users_qs)

        # Create lookup dictionaries for efficient matching
        users_by_phone = {
            u.phone_number: u for u in existing_users_list if u.phone_number
        }
        users_by_email = {u.email: u for u in existing_users_list if u.email}

        # Categorize contacts
        existing_users = []
        invite_needed = []

        for contact in valid_contacts:
            user = None

            # Check phone first, then email
            if "phone" in contact and contact["phone"] in users_by_phone:
                user = users_by_phone[contact["phone"]]
            elif "email" in contact and contact["email"] in users_by_email:
                user = users_by_email[contact["email"]]

            if user:
                # Exclude current user from results
                if user.id != request.user.id:
                    existing_users.append(BaseUserSerializer(user).data)
            else:
                invite_needed.append(contact)

        logger.info(
            "verify_contacts completed for user_id=%s: %d existing, %d invite_needed, %d invalid",
            request.user.id,
            len(existing_users),
            len(invite_needed),
            len(invalid_contacts),
        )

        return CustomResponse(
            data={
                "existing_users": existing_users,
                "invite_needed": invite_needed,
                "invalid_contacts": invalid_contacts,
            },
            message=f"Verified {len(valid_contacts)} contacts",
            status_code=status.HTTP_200_OK,
        )

    except BadRequestError:
        raise
    except Exception as exc:
        logger.exception(
            "Unexpected error in verify_contacts for user_id=%s: %s",
            request.user.id,
            exc,
        )
        raise BadRequestError("Failed to verify contacts. Please try again.")
