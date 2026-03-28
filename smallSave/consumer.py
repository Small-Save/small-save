import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)


class BiddingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.round_id = self.scope["url_route"]["kwargs"]["round_id"]
        self.room_group_name = f"bidding_{self.round_id}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        logger.info("WebSocket connected: round_id=%s channel=%s", self.round_id, self.channel_name)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        logger.info(
            "WebSocket disconnected: round_id=%s channel=%s code=%s",
            self.round_id,
            self.channel_name,
            close_code,
        )

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            logger.warning("Invalid JSON received on round_id=%s: %s", self.round_id, text_data[:200])
            return

        message_type = data.get("type")

        if message_type == "new_bid":
            logger.debug("Broadcasting new_bid on round_id=%s", self.round_id)
            await self.channel_layer.group_send(self.room_group_name, {"type": "bid_update", "bid": data.get("bid")})
        else:
            logger.warning("Unknown message type '%s' on round_id=%s", message_type, self.round_id)

    async def bid_update(self, event):
        await self.send(text_data=json.dumps({"type": "bid_update", "bid": event["bid"]}))
