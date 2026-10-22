import json
from channels.generic.websocket import AsyncJsonWebsocketConsumer


class NotificationConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        self.user_group = f"user_{self.user.id}"
        await self.channel_layer.group_add(self.user_group, self.channel_name)

        # If user is teacher, also join teacher group
        if getattr(self.user, 'role', '') == 'TEACHER':
            await self.channel_layer.group_add("teachers_group", self.channel_name)

        await self.accept()

        # Send initial connected confirmation
        await self.send_json({
            'type': 'connection_established',
            'message': f'Connected to real-time notification stream as {self.user.full_name}',
            'user_id': self.user.id
        })

    async def disconnect(self, close_code):
        if hasattr(self, 'user_group'):
            await self.channel_layer.group_discard(self.user_group, self.channel_name)
        if getattr(getattr(self, 'user', None), 'role', '') == 'TEACHER':
            await self.channel_layer.group_discard("teachers_group", self.channel_name)

    async def receive_json(self, content, **kwargs):
        # Client can send ping/pong or acknowledge
        msg_type = content.get('type')
        if msg_type == 'ping':
            await self.send_json({'type': 'pong'})

    async def send_notification(self, event):
        """Handler for 'send_notification' group message."""
        await self.send_json({
            'type': 'new_notification',
            'notification': event['notification']
        })

    async def doubt_update(self, event):
        """Handler for 'doubt_update' group message."""
        await self.send_json({
            'type': 'doubt_update',
            'data': event['data']
        })
