import logging

from rest_framework import status
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from utils.response import CustomResponse

from .models import Notification
from .serializers import NotificationSerializer

logger = logging.getLogger(__name__)


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def list_notifications(request):
    limit = min(int(request.query_params.get("limit", 50)), 100)
    offset = int(request.query_params.get("offset", 0))

    notifications = (
        Notification.objects.filter(user=request.user)
        .order_by("-created_at")[offset : offset + limit]
    )

    data = NotificationSerializer(notifications, many=True).data
    return CustomResponse(
        is_success=True,
        data=data,
        message="Notifications fetched successfully",
        status_code=status.HTTP_200_OK,
    )


@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def unread_count(request):
    count = Notification.objects.filter(user=request.user, is_read=False).count()
    return CustomResponse(
        is_success=True,
        data={"count": count},
        message="Unread count fetched",
        status_code=status.HTTP_200_OK,
    )


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def mark_as_read(request, notification_id):
    try:
        notification = Notification.objects.get(id=notification_id, user=request.user)
    except Notification.DoesNotExist:
        return CustomResponse(
            is_success=False,
            error="Notification not found",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    notification.is_read = True
    notification.save(update_fields=["is_read"])

    logger.info(
        "Notification marked as read: id=%s user_id=%s",
        notification_id,
        request.user.id,
    )
    return CustomResponse(
        is_success=True,
        message="Notification marked as read",
        status_code=status.HTTP_200_OK,
    )


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def mark_all_as_read(request):
    updated = Notification.objects.filter(user=request.user, is_read=False).update(
        is_read=True
    )

    logger.info(
        "All notifications marked as read: user_id=%s count=%s",
        request.user.id,
        updated,
    )
    return CustomResponse(
        is_success=True,
        message="All notifications marked as read",
        status_code=status.HTTP_200_OK,
    )
