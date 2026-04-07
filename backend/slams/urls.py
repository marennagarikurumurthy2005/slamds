from django.urls import path

from slams.views import AdminSlamListView, SlamDetailView, SlamListCreateView


urlpatterns = [
    path("admin/", AdminSlamListView.as_view(), name="admin-slam-list"),
    path("", SlamListCreateView.as_view(), name="slam-list-create"),
    path("<str:pk>/", SlamDetailView.as_view(), name="slam-detail"),
]
