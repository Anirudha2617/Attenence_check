from django.db import models
from apps.subjects.models import Subject

class Timetable(models.Model):
    DAYS = [
        (0, 'Monday'), (1, 'Tuesday'), (2, 'Wednesday'), (3, 'Thursday'),
        (4, 'Friday'), (5, 'Saturday'), (6, 'Sunday')
    ]
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='timetable_entries')
    day_of_week = models.IntegerField(choices=DAYS)
    start_time = models.TimeField()
    end_time = models.TimeField()
    # Logic: From start_date to end_date (if provided), repeat every 7 days
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    auto_renew = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.subject.name} - {self.get_day_of_week_display()} {self.start_time}"

class ClassSession(models.Model):
    STATUS_CHOICES = [
        ('PRESENT', 'Present'),
        ('ABSENT', 'Absent'),
        ('NOT_ATTENDED', 'Not Attended'),
        ('CANCELLED', 'Cancelled'),
    ]
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='sessions')
    timetable_entry = models.ForeignKey(Timetable, on_delete=models.SET_NULL, null=True, blank=True, related_name='generated_sessions')
    scheduled_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NOT_ATTENDED')
    
    class Meta:
        ordering = ['scheduled_date', 'start_time']
        unique_together = ('subject', 'scheduled_date', 'start_time')

    def __str__(self):
        return f"{self.subject.name} ({self.scheduled_date}) - {self.status}"
