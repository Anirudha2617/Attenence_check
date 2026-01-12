from django.contrib import admin
from .models import Timetable, ClassSession

@admin.register(Timetable)
class TimetableAdmin(admin.ModelAdmin):
    list_display = ('subject', 'day_of_week', 'start_time', 'end_time', 'auto_renew')
    list_filter = ('day_of_week', 'auto_renew')

@admin.register(ClassSession)
class ClassSessionAdmin(admin.ModelAdmin):
    list_display = ('subject', 'scheduled_date', 'start_time', 'status')
    list_filter = ('status', 'scheduled_date')
