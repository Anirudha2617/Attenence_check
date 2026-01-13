from rest_framework import viewsets, permissions, status, views
from rest_framework.response import Response
from .models import Timetable, ClassSession
from .serializers import TimetableSerializer, ClassSessionSerializer
from datetime import timedelta, date
from django.db.models import Q

class TimetableViewSet(viewsets.ModelViewSet):
    serializer_class = TimetableSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Timetable.objects.filter(subject__user=self.request.user)

    def perform_create(self, serializer):
        timetable = serializer.save()
        # Auto-generate sessions for the upcoming month
        generate_sessions(timetable)

class ClassSessionViewSet(viewsets.ModelViewSet):
    serializer_class = ClassSessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'head', 'options'] # Only allow status updates

    def get_queryset(self):
        queryset = ClassSession.objects.filter(subject__user=self.request.user)
        subject_id = self.request.query_params.get('subject', None)
        if subject_id is not None:
            queryset = queryset.filter(subject_id=subject_id)
        return queryset

class GenerateSessionsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        timetables = Timetable.objects.filter(subject__user=request.user, auto_renew=True)
        count = 0
        for tt in timetables:
            count += generate_sessions(tt)
        return Response({"message": f"Generated {count} sessions."})

def generate_sessions(timetable):
    """
    Generates sessions for a specific timetable entry for the next 30 days.
    Avoids duplicates.
    """
    today = date.today()
    # If start_date is in future, start there. Else start today.
    start_point = max(timetable.start_date, today)
    
    # Generate for 4 weeks out
    limit_date = today + timedelta(weeks=4)
    if timetable.end_date:
        limit_date = min(limit_date, timetable.end_date)
    
    current = start_point
    sessions_created = 0
    
    # Calculate difference to next occurrence
    # day_of_week: 0=Mon, 6=Sun
    # current.weekday() returns 0=Mon
    
    while current <= limit_date:
        if current.weekday() == timetable.day_of_week:
            # Check if exists
            obj, created = ClassSession.objects.get_or_create(
                subject=timetable.subject,
                timetable_entry=timetable,
                scheduled_date=current,
                start_time=timetable.start_time,
                defaults={
                    'end_time': timetable.end_time,
                    'status': 'NOT_ATTENDED'
                }
            )
            if created:
                sessions_created += 1
            # Move to next week
            current += timedelta(days=7)
        else:
            # Move to next day until we find the right day
            # Optimization: could jump directly.
            days_ahead = (timetable.day_of_week - current.weekday()) % 7
            if days_ahead == 0:
                days_ahead = 7
            current += timedelta(days=days_ahead)
            
    return sessions_created
