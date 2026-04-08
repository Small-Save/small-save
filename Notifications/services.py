from __future__ import annotations

import logging
from typing import Any

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import Notification
from .serializers import NotificationSerializer

logger = logging.getLogger(__name__)


def notify_user(
    user,
    notification_type: str,
    title: str,
    body: str,
    data: dict[str, Any] | None = None,
) -> Notification:
    """Persist a notification and push it to the user's WebSocket channel."""
    notification = Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        body=body,
        data=data,
    )

    channel_layer = get_channel_layer()
    if channel_layer is not None:
        group_name = f"notifications_{user.id}"
        payload = NotificationSerializer(notification).data
        try:
            async_to_sync(channel_layer.group_send)(
                group_name,
                {"type": "send_notification", "notification": payload},
            )
        except Exception:
            logger.exception(
                "Failed to push notification via WebSocket: notification_id=%s user_id=%s",
                notification.pk,
                user.id,
            )

    logger.info(
        "Notification created: id=%s type=%s user_id=%s",
        notification.pk,
        notification_type,
        user.id,
    )
    return notification


def notify_users_bulk(users, notification_type: str, title: str, body: str, data=None):
    """Convenience wrapper to notify multiple users."""
    for user in users:
        notify_user(user, notification_type, title, body, data)
