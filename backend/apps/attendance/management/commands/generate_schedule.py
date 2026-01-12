from django.core.management.base import BaseCommand
from apps.attendance.models import Timetable
from apps.attendance.views import generate_sessions

class Command(BaseCommand):
    help = 'Auto-generates weekly classes based on timetables'

    def handle(self, *args, **options):
        timetables = Timetable.objects.filter(auto_renew=True)
        count = 0
        for tt in timetables:
            count += generate_sessions(tt)
        self.stdout.write(self.style.SUCCESS(f'Successfully generated {count} sessions.'))
