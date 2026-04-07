"""
Django settings for the MK Slam Collector backend.
"""

from datetime import timedelta
import os
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")


def env_bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def env_int(name: str, default: int) -> int:
    try:
        return int(os.getenv(name, str(default)).strip())
    except (TypeError, ValueError):
        return default


def env_list(name: str, default: str = "") -> list[str]:
    raw_value = os.getenv(name, default)
    return [item.strip() for item in raw_value.split(",") if item.strip()]


def env_star_list(name: str, default: str = "") -> list[str]:
    return env_list(name, default)


def normalize_origin(value: str) -> str:
    candidate = value.strip()
    if "://" not in candidate:
        return candidate.rstrip("/")

    parts = urlsplit(candidate)
    if parts.scheme and parts.netloc:
        return f"{parts.scheme}://{parts.netloc}"

    return candidate.rstrip("/")


def normalize_origin_list(values: list[str]) -> list[str]:
    return [normalize_origin(value) for value in values if normalize_origin(value)]


def sanitize_mongo_uri(raw_uri: str) -> str:
    if "://" not in raw_uri:
        return raw_uri

    scheme, remainder = raw_uri.split("://", 1)
    if scheme not in {"mongodb", "mongodb+srv"} or "@" not in remainder:
        return raw_uri

    userinfo, hostinfo = remainder.rsplit("@", 1)
    if ":" in userinfo:
        username, password = userinfo.split(":", 1)
        username = quote(unquote(username), safe="")
        password = quote(unquote(password), safe="")
        sanitized_userinfo = f"{username}:{password}"
    else:
        sanitized_userinfo = quote(unquote(userinfo), safe="")

    return f"{scheme}://{sanitized_userinfo}@{hostinfo}"


SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "django-insecure-mk-slam-collector-dev-key-change-me",
)
DEBUG = env_bool("DJANGO_DEBUG", True)
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "127.0.0.1,localhost")
RENDER_EXTERNAL_HOSTNAME = os.getenv("RENDER_EXTERNAL_HOSTNAME", "").strip()

if RENDER_EXTERNAL_HOSTNAME and RENDER_EXTERNAL_HOSTNAME not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)


INSTALLED_APPS = [
    "config.apps.MongoAdminConfig",
    "config.apps.MongoAuthConfig",
    "config.apps.MongoContentTypesConfig",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django_mongodb_backend",
    "corsheaders",
    "rest_framework",
    "accounts",
    "slams",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"


DATABASES = {
    "default": {
        "ENGINE": "django_mongodb_backend",
        "HOST": sanitize_mongo_uri(
            os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/")
        ),
        "NAME": os.getenv("MONGO_DB_NAME", "mk_slam_collector"),
        "OPTIONS": {
            "serverSelectionTimeoutMS": env_int("MONGO_SERVER_SELECTION_TIMEOUT_MS", 5000),
            "connectTimeoutMS": env_int("MONGO_CONNECT_TIMEOUT_MS", 5000),
            "socketTimeoutMS": env_int("MONGO_SOCKET_TIMEOUT_MS", 10000),
        },
    }
}

DATABASE_ROUTERS = ["django_mongodb_backend.routers.MongoRouter"]


AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


LANGUAGE_CODE = "en-us"
TIME_ZONE = os.getenv("DJANGO_TIME_ZONE", "Asia/Kolkata")
USE_I18N = True
USE_TZ = True


STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}


DEFAULT_AUTO_FIELD = "django_mongodb_backend.fields.ObjectIdAutoField"
MIGRATION_MODULES = {
    "admin": "mongo_migrations.admin",
    "auth": "mongo_migrations.auth",
    "contenttypes": "mongo_migrations.contenttypes",
}


AUTH_USER_MODEL = "accounts.User"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_RENDERER_CLASSES": (
        "rest_framework.renderers.JSONRenderer",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": False,
    "UPDATE_LAST_LOGIN": True,
    "ALGORITHM": "HS256",
    "SIGNING_KEY": SECRET_KEY,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

REFRESH_COOKIE_NAME = os.getenv("JWT_REFRESH_COOKIE_NAME", "mk_refresh_token")
REFRESH_COOKIE_SECURE = env_bool("JWT_REFRESH_COOKIE_SECURE", not DEBUG)
REFRESH_COOKIE_SAMESITE = os.getenv(
    "JWT_REFRESH_COOKIE_SAMESITE",
    "Lax" if DEBUG else "Strict",
)
REFRESH_COOKIE_DOMAIN = os.getenv("JWT_REFRESH_COOKIE_DOMAIN") or None
FRONTEND_URL = normalize_origin(os.getenv("FRONTEND_URL", "http://localhost:5173"))


CORS_ALLOWED_ORIGINS = normalize_origin_list(env_list("CORS_ALLOWED_ORIGINS", FRONTEND_URL))
CORS_ALLOWED_ORIGIN_REGEXES = env_star_list("CORS_ALLOWED_ORIGIN_REGEXES")
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = normalize_origin_list(env_list("CSRF_TRUSTED_ORIGINS", FRONTEND_URL))

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = env_bool("SESSION_COOKIE_SECURE", not DEBUG)
CSRF_COOKIE_SECURE = env_bool("CSRF_COOKIE_SECURE", not DEBUG)
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"
SECURE_REFERRER_POLICY = "strict-origin-when-cross-origin"
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = env_bool("SECURE_SSL_REDIRECT", False)
SECURE_HSTS_SECONDS = int(os.getenv("SECURE_HSTS_SECONDS", "0"))
SECURE_HSTS_INCLUDE_SUBDOMAINS = env_bool("SECURE_HSTS_INCLUDE_SUBDOMAINS", False)
SECURE_HSTS_PRELOAD = env_bool("SECURE_HSTS_PRELOAD", False)
