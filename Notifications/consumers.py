import json
import logging
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = await self._authenticate()

        if self.user is None:
            logger.warning("WebSocket notification auth failed — closing connection")
            await self.close()
            return

        self.group_name = f"notifications_{self.user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        logger.info(
            "Notification WebSocket connected: user_id=%s channel=%s",
            self.user.id,
            self.channel_name,
        )

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        logger.info(
            "Notification WebSocket disconnected: user_id=%s code=%s",
            self.user.id,
            close_code,
        )

    async def send_notification(self, event):
        await self.send(
            text_data=json.dumps(
                {"type": "notification", "notification": event["notification"]}
            )
        )

    async def _authenticate(self):
        query_string = self.scope.get("query_string", b"").decode("utf-8")
        params = parse_qs(query_string)
        token_list = params.get("token", [])

        if not token_list:
            return None

        try:
            from django.contrib.auth import get_user_model
            from rest_framework_simplejwt.tokens import AccessToken

            access_token = AccessToken(token_list[0])
            user_id = access_token["user_id"]
            User = get_user_model()
            user = await database_sync_to_async(User.objects.get)(id=user_id)
            return user
        except Exception:
            logger.exception("WebSocket JWT validation failed")
            return None
