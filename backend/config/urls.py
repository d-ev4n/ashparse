from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('scraper.urls')),
    path('api/auth/', include('users.urls')),
    path('api/keys/', include('apikeys.urls')),
]