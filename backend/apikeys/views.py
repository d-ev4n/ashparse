import secrets
import hashlib

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .models import APIKey


class GenerateAPIKeyView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        name = request.data.get('name', 'My API Key')

        raw_key = 'ash_live_' + secrets.token_urlsafe(32)

        key_hash = hashlib.sha256(
            raw_key.encode()
        ).hexdigest()

        APIKey.objects.create(
            user=request.user,
            name=name,
            key_hash=key_hash
        )

        return Response({
            "success": True,
            "message": "API key generated successfully",
            "api_key": raw_key
        }, status=status.HTTP_201_CREATED)