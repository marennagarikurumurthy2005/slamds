from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken


def issue_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token
    access["email"] = user.email
    access["name"] = user.full_name
    access["is_admin"] = user.is_admin
    return str(access), str(refresh)


def set_refresh_cookie(response, refresh_token: str):
    response.set_cookie(
        settings.REFRESH_COOKIE_NAME,
        refresh_token,
        max_age=int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds()),
        httponly=True,
        secure=settings.REFRESH_COOKIE_SECURE,
        samesite=settings.REFRESH_COOKIE_SAMESITE,
        domain=settings.REFRESH_COOKIE_DOMAIN,
        path="/api/v1/auth/",
    )


def clear_refresh_cookie(response):
    response.delete_cookie(
        settings.REFRESH_COOKIE_NAME,
        domain=settings.REFRESH_COOKIE_DOMAIN,
        path="/api/v1/auth/",
        samesite=settings.REFRESH_COOKIE_SAMESITE,
    )
