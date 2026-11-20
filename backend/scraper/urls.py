from django.urls import path
from .views import ScrapeAPIView, ScrapeHistoryAPIView

urlpatterns = [
    path('scrape/', ScrapeAPIView.as_view(), name='scrape'),
    path('history/', ScrapeHistoryAPIView.as_view(), name='history'),
]