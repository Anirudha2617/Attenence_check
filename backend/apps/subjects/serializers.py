from rest_framework import serializers
from .models import Subject
from django.utils import timezone

class SubjectSerializer(serializers.ModelSerializer):
    attendance_percentage = serializers.SerializerMethodField()
    total_classes = serializers.SerializerMethodField()
    next_class = serializers.SerializerMethodField()
    last_attended = serializers.SerializerMethodField()

    class Meta:
        model = Subject
        fields = ['id', 'name', 'created_at', 'attendance_percentage', 'total_classes', 'next_class', 'last_attended']
        read_only_fields = ['created_at']

    def get_attendance_percentage(self, obj):
        total = obj.sessions.exclude(status='CANCELLED').count()
        attended = obj.sessions.filter(status='PRESENT').count()
        if total == 0:
            return 0
        return round((attended / total) * 100, 1)

    def get_total_classes(self, obj):
        return obj.sessions.count()

    def get_next_class(self, obj):
        now = timezone.now()
        # Find next session: status NOT cancelled, scheduled_date >= today
        # We need a proper datetime filter, but sessions split date/time. 
        # For simplicity, filtering by scheduled_date >= today
        upcoming = obj.sessions.filter(scheduled_date__gte=now.date()).exclude(status='CANCELLED').order_by('scheduled_date', 'start_time').first()
        if upcoming:
            return {
                'date': upcoming.scheduled_date, # Formats to ISO YYYY-MM-DD
                'time': upcoming.start_time.strftime('%I:%M %p'),
                'day': upcoming.scheduled_date.strftime('%A')
            }
        return None

    def get_last_attended(self, obj):
        last = obj.sessions.filter(status='PRESENT', scheduled_date__lte=timezone.now().date()).order_by('-scheduled_date', '-start_time').first()
        if last:
            return last.scheduled_date # YYYY-MM-DD
        return None
