from django.urls import path

from accounts.views import (
    AdminUserDetailView,
    AdminResetPasswordView,
    AdminUserListView,
    LoginView,
    LogoutView,
    MeView,
    RefreshSessionView,
    SignupView,
)


urlpatterns = [
    path("signup/", SignupView.as_view(), name="signup"),
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", RefreshSessionView.as_view(), name="refresh-session"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("admin/users/", AdminUserListView.as_view(), name="admin-user-list"),
    path("admin/users/<str:pk>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
    path(
        "admin/users/<str:pk>/reset-password/",
        AdminResetPasswordView.as_view(),
        name="admin-reset-password",
    ),
]
