from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.http import HttpResponseRedirect

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from datetime import timedelta

# 0Auth2
import requests
from django.shortcuts import redirect
from django.conf import settings

class TokenFromCookieAuthentication(JWTAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get('access_token')
        if not access_token:
            return None

        try:
            validated_token = self.get_validated_token(access_token)
            user = self.get_user(validated_token)
            return (user, validated_token)
        except InvalidToken:
            refresh_token = request.COOKIES.get('refresh_token')
            if not refresh_token:
                return None

            try:
                refresh = RefreshToken(refresh_token)
                access_token = str(refresh.access_token)

                request.COOKIES['access_token'] = access_token

                validated_token = self.get_validated_token(access_token)
                user = self.get_user(validated_token)
                return (user, validated_token)
            except TokenError:
                return None

        return None

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        username = request.data.get('username')
        password = request.data.get('password')

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(email=email, username=username, password=password)

        # TODO commented this since there seems to be issued with it as it's not getting saved in the DB
        # user.publicuser.display_name = username
        # user.publicuser.save()

        return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(email=email, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            response = Response({'message': 'Login successful'})

            # Utiliser des valeurs par défaut si SIMPLE_JWT n'est pas configuré
            access_token_lifetime = getattr(settings, 'SIMPLE_JWT', {}).get('ACCESS_TOKEN_LIFETIME', timedelta(minutes=5))
            refresh_token_lifetime = getattr(settings, 'SIMPLE_JWT', {}).get('REFRESH_TOKEN_LIFETIME', timedelta(days=1))

            response.set_cookie(
                'access_token',
                str(refresh.access_token),
                max_age=int(access_token_lifetime.total_seconds()),
                httponly=True,
                samesite='Lax',
                secure=settings.DEBUG is False
            )
            response.set_cookie(
                'refresh_token',
                str(refresh),
                max_age=int(refresh_token_lifetime.total_seconds()),
                httponly=True,
                samesite='Lax',
                secure=settings.DEBUG is False
            )
            return response
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        try:
            refresh = RefreshToken(refresh_token)
            new_access_token = str(refresh.access_token)
            return Response({'access_token': new_access_token})
        except Exception as e:
            return Response({'error': 'Invalid or expired refresh token'}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    authentication_classes = [TokenFromCookieAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.COOKIES.get('refresh_token')
            token = RefreshToken(refresh_token)
            token.blacklist()
            response = Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
            response.delete_cookie('access_token')
            response.delete_cookie('refresh_token')
            return response
        except TokenError:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class OAuth42LoginView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        auth_url = f"https://api.intra.42.fr/oauth/authorize?client_id={settings.OAUTH2_42_CLIENT_ID}&redirect_uri={settings.OAUTH2_42_REDIRECT_URI}&response_type=code"
        return redirect(auth_url)

from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class OAuth42CallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        code = request.GET.get('code')
        if not code:
            return Response({'error': 'No code provided'}, status=status.HTTP_400_BAD_REQUEST)

        token_url = "https://api.intra.42.fr/oauth/token"
        data = {
            'grant_type': 'authorization_code',
            'client_id': settings.OAUTH2_42_CLIENT_ID,
            'client_secret': settings.OAUTH2_42_CLIENT_SECRET,
            'code': code,
            'redirect_uri': settings.OAUTH2_42_REDIRECT_URI
        }
        response = requests.post(token_url, data=data)
        if response.status_code != 200:
            return Response({'error': 'Failed to obtain token'}, status=status.HTTP_400_BAD_REQUEST)

        access_token = response.json().get('access_token')

        user_url = "https://api.intra.42.fr/v2/me"
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(user_url, headers=headers)
        if response.status_code != 200:
            return Response({'error': 'Failed to get user info'}, status=status.HTTP_400_BAD_REQUEST)

        user_info = response.json()
        email = user_info.get('email')
        username = user_info.get('login')

        user, created = User.objects.get_or_create(email=email, defaults={'username': username})
        if created:
            user.set_unusable_password()
            user.publicuser.display_name = username
            user.save()

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = HttpResponseRedirect(settings.FRONTEND_URL)

        access_token_lifetime = getattr(settings, 'SIMPLE_JWT', {}).get('ACCESS_TOKEN_LIFETIME', timedelta(minutes=5))
        refresh_token_lifetime = getattr(settings, 'SIMPLE_JWT', {}).get('REFRESH_TOKEN_LIFETIME', timedelta(days=1))

        response.set_cookie(
            'access_token',
            access_token,
            max_age=access_token_lifetime.total_seconds(),
            httponly=True,
            samesite='Lax',
            secure=settings.DEBUG is False
        )
        response.set_cookie(
            'refresh_token',
            refresh_token,
            max_age=refresh_token_lifetime.total_seconds(),
            httponly=True,
            samesite='Lax',
            secure=settings.DEBUG is False
        )

        return response
