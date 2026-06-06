"""
Mini LMS - Root URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "message": "Welcome to the Mini LMS API",
        "status": "Online",
        "documentation": "/api/ docs coming soon..."
    })

urlpatterns = [
    # Root URL
    path('', api_root, name='api-root'),
    
    # Django Admin
    path('admin/', admin.site.urls),

    # API Endpoints
    path('api/auth/', include('authentication.urls')),
    path('api/', include('courses.urls')),
    path('api/', include('lessons.urls')),
    path('api/', include('enrollments.urls')),
    path('api/', include('assignments.urls')),
    path('api/analytics/', include('analytics.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
