from rest_framework import serializers
from .models import Timetable, ClassSession
from apps.subjects.models import Subject

class TimetableSerializer(serializers.ModelSerializer):
    subject_id = serializers.PrimaryKeyRelatedField(
        queryset=Subject.objects.all(), source='subject', write_only=True
    )
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = Timetable
        fields = ['id', 'subject_id', 'subject_name', 'day_of_week', 'start_time', 'end_time', 'start_date', 'end_date', 'auto_renew']

    def validate_subject_id(self, value):
        user = self.context['request'].user
        if value.user != user:
            raise serializers.ValidationError("Invalid subject.")
        return value

class ClassSessionSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    
    class Meta:
        model = ClassSession
        fields = ['id', 'subject', 'subject_name', 'scheduled_date', 'start_time', 'end_time', 'status']
        read_only_fields = ['subject', 'scheduled_date', 'start_time', 'end_time']
