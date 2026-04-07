from django.contrib import admin
from django.urls import include, path

from config.views import WakeupView

urlpatterns = [
    path("", WakeupView.as_view(), name="root-wakeup"),
    path("admin/", admin.site.urls),
    path("api/v1/wakeup/", WakeupView.as_view(), name="wakeup"),
    path("api/v1/auth/", include("accounts.urls")),
    path("api/v1/slams/", include("slams.urls")),
]
