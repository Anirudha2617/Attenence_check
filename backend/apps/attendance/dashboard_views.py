from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ClassSession
from django.db.models import Count, Q
from datetime import date, timedelta

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        sessions = ClassSession.objects.filter(subject__user=user)
        
        # 1. Overall Stats
        total_sessions = sessions.exclude(status='CANCELLED').count()
        attended_sessions = sessions.filter(status='PRESENT').count()
        attendance_percentage = 0
        if total_sessions > 0:
            attendance_percentage = round((attended_sessions / total_sessions) * 100, 1)
            
        # 2. Today's Sessions
        today = date.today()
        today_sessions_qs = sessions.filter(scheduled_date=today).select_related('subject')
        today_sessions_data = []
        for s in today_sessions_qs:
            today_sessions_data.append({
                'id': s.id,
                'subject': s.subject.name,
                'time': f"{s.start_time.strftime('%I:%M %p')} - {s.end_time.strftime('%I:%M %p')}",
                'status': s.status
            })

        # 3. Subject-wise Stats (For Bar Chart)
        # Groups by subject, counts present vs total (excluding cancelled)
        subject_data = []
        subjects = user.subjects.all()
        for sub in subjects:
            sub_sessions = sessions.filter(subject=sub).exclude(status='CANCELLED')
            total = sub_sessions.count()
            present = sub_sessions.filter(status='PRESENT').count()
            percent = 0
            if total > 0:
                percent = round((present / total) * 100, 1)
            subject_data.append({
                'name': sub.name,
                'present': present,
                'total': total,
                'percent': percent
            })

        # 4. Daily Trends (Last 7 Days)
        daily_stats = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            day_sessions = sessions.filter(scheduled_date=day).exclude(status='CANCELLED')
            total = day_sessions.count()
            attended = day_sessions.filter(status='PRESENT').count()
            # If no classes, we can skip or show 0
            daily_stats.append({
                'date': day.strftime('%a'), # Mon, Tue
                'fullDate': day.strftime('%Y-%m-%d'),
                'present': attended,
                'total': total
            })

        return Response({
            'stats': {
                'percent': attendance_percentage,
                'attended': attended_sessions,
                'total': total_sessions
            },
            'todaySessions': today_sessions_data,
            'subjectStats': subject_data,
            'dailyStats': daily_stats
        })
