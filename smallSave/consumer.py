import json

from channels.generic.websocket import AsyncWebsocketConsumer


class BiddingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.round_id = self.scope["url_route"]["kwargs"]["round_id"]
        self.room_group_name = f"bidding_{self.round_id}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):  # noqa: ARG002
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get("type")

        if message_type == "new_bid":
            # Broadcast new bid to all participants
            await self.channel_layer.group_send(self.room_group_name, {"type": "bid_update", "bid": data.get("bid")})

    async def bid_update(self, event):
        # Send bid update to WebSocket
        await self.send(text_data=json.dumps({"type": "bid_update", "bid": event["bid"]}))
