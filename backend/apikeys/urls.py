from django.urls import path
from .views import GenerateAPIKeyView

urlpatterns = [
    path('generate/', GenerateAPIKeyView.as_view(), name='generate-api-key'),
]