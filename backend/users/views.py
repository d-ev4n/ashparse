
from django.contrib.auth import authenticate

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token

from .serializers import RegisterSerializer


# User Registration
class RegisterAPIView(APIView):

    def post(self, request):

        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save()

            return Response({
                "success": True,
                "message": "User registered successfully",
                "user": serializer.data
            }, status=status.HTTP_201_CREATED)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# User Login
class LoginAPIView(APIView):

    def post(self, request):

        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(
            username=username,
            password=password
        )

        if user:

            token, created = Token.objects.get_or_create(user=user)

            return Response({
                "success": True,
                "message": "Login successful",
                "token": token.key,
                "username": user.username
            })

        return Response({
            "success": False,
            "message": "Invalid username or password"
        }, status=status.HTTP_401_UNAUTHORIZED)
