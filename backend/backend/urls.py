from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from apps.users.views import RegisterView, UserDetailView
from apps.subjects.views import SubjectViewSet
from apps.attendance.views import TimetableViewSet, ClassSessionViewSet, GenerateSessionsView
from apps.attendance.dashboard_views import DashboardView

router = DefaultRouter()
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'timetables', TimetableViewSet, basename='timetable')
router.register(r'sessions', ClassSessionViewSet, basename='session')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Auth
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', RegisterView.as_view(), name='register'),
    path('api/me/', UserDetailView.as_view(), name='user_detail'),
    
    # RPC
    path('api/generate/', GenerateSessionsView.as_view(), name='generate_sessions'),
    path('api/dashboard-stats/', DashboardView.as_view(), name='dashboard_stats'),

    # API
    path('api/', include(router.urls)),
]
