from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    related_doubt_id = serializers.CharField(source='related_doubt.doubt_id', read_only=True, default=None)
    related_doubt_title = serializers.CharField(source='related_doubt.title', read_only=True, default=None)

    class Meta:
        model = Notification
        fields = [
            'id',
            'title',
            'message',
            'notification_type',
            'related_doubt_id',
            'related_doubt_title',
            'is_read',
            'created_at'
        ]
