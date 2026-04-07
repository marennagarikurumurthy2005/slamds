from django.db.models import Q
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db.utils import DatabaseError
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.serializers import (
    AdminUserDetailSerializer,
    AdminPasswordResetSerializer,
    AdminUserSerializer,
    LoginSerializer,
    SignupSerializer,
    UserSerializer,
)
from accounts.services import clear_refresh_cookie, issue_tokens_for_user, set_refresh_cookie
from slams.models import Slam
from slams.serializers import AdminSlamSerializer


User = get_user_model()


def get_regular_user_queryset():
    return User.objects.exclude(is_staff=True, is_superuser=True)


def database_unavailable_response():
    return Response(
        {"detail": "Database is unavailable right now. Please try again in a moment."},
        status=status.HTTP_503_SERVICE_UNAVAILABLE,
    )


class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = SignupSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()
            access_token, refresh_token = issue_tokens_for_user(user)
            response = Response(
                {
                    "message": "Signup successful.",
                    "access_token": access_token,
                    "user": UserSerializer(user).data,
                },
                status=status.HTTP_201_CREATED,
            )
            set_refresh_cookie(response, refresh_token)
            return response
        except DatabaseError:
            return database_unavailable_response()


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        try:
            serializer = LoginSerializer(data=request.data, context={"request": request})
            serializer.is_valid(raise_exception=True)
            user = serializer.validated_data["user"]
            access_token, refresh_token = issue_tokens_for_user(user)
            response = Response(
                {
                    "message": "Login successful.",
                    "access_token": access_token,
                    "user": UserSerializer(user).data,
                }
            )
            set_refresh_cookie(response, refresh_token)
            return response
        except DatabaseError:
            return database_unavailable_response()


class RefreshSessionView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        raw_refresh_token = request.COOKIES.get(settings.REFRESH_COOKIE_NAME)
        if not raw_refresh_token:
            return Response(
                {"detail": "Refresh token is missing."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh = RefreshToken(raw_refresh_token)
            user_id = refresh["user_id"]
        except TokenError:
            response = Response(
                {"detail": "Refresh token is invalid or expired."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            clear_refresh_cookie(response)
            return response

        try:
            user = User.objects.get(pk=user_id, is_active=True)
        except User.DoesNotExist:
            response = Response(
                {"detail": "User account could not be restored."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            clear_refresh_cookie(response)
            return response
        except DatabaseError:
            return database_unavailable_response()

        access_token, _ = issue_tokens_for_user(user)
        return Response(
            {
                "message": "Session restored.",
                "access_token": access_token,
                "user": UserSerializer(user).data,
            }
        )


class LogoutView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        response = Response({"message": "Logged out successfully."})
        clear_refresh_cookie(response)
        return response


class MeView(APIView):
    def get(self, request):
        try:
            return Response(UserSerializer(request.user).data)
        except DatabaseError:
            return database_unavailable_response()


class AdminUserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        search = request.query_params.get("search", "").strip()
        queryset = get_regular_user_queryset().order_by("full_name", "email")

        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search)
                | Q(email__icontains=search)
                | Q(roll_number__icontains=search)
            )

        return Response(
            {
                "results": AdminUserSerializer(queryset, many=True).data,
                "meta": {
                    "count": queryset.count(),
                },
            }
        )


class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, pk):
        try:
            target_user = get_regular_user_queryset().get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        user_slams = Slam.objects.filter(author_id=target_user.pk).order_by("-updated_at")

        return Response(
            {
                "user": AdminUserDetailSerializer(target_user).data,
                "stats": {
                    "total_slams": user_slams.count(),
                    "draft_slams": user_slams.filter(status=Slam.Status.DRAFT).count(),
                    "submitted_slams": user_slams.filter(status=Slam.Status.SUBMITTED).count(),
                    "deleted_slams": user_slams.filter(is_deleted=True).count(),
                    "active_slams": user_slams.filter(is_deleted=False).count(),
                },
                "slams": AdminSlamSerializer(user_slams, many=True).data,
            }
        )


class AdminResetPasswordView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request, pk):
        try:
            target_user = get_regular_user_queryset().get(pk=pk)
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = AdminPasswordResetSerializer(
            data=request.data,
            context={"target_user": target_user},
        )
        serializer.is_valid(raise_exception=True)

        new_password = serializer.validated_data["resolved_password"]
        target_user.set_password(new_password)
        target_user.save(update_fields=["password"])

        return Response(
            {
                "detail": "Password reset successfully.",
                "temporary_password": new_password,
                "user": AdminUserSerializer(target_user).data,
            }
        )
