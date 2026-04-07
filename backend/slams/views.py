from django.db.models import Q
from rest_framework import generics, status
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from slams.models import Slam
from slams.serializers import AdminSlamSerializer, SlamReadSerializer, SlamWriteSerializer


class SlamListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Slam.objects.active().filter(author_id=self.request.user.pk).order_by("-updated_at")

    def get_serializer_class(self):
        if self.request.method == "GET":
            return SlamReadSerializer
        return SlamWriteSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {
                "results": serializer.data,
                "meta": {
                    "count": queryset.count(),
                    "drafts": queryset.filter(status=Slam.Status.DRAFT).count(),
                    "submitted": queryset.filter(status=Slam.Status.SUBMITTED).count(),
                },
            }
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        slam = serializer.save(author=request.user)
        return Response(SlamReadSerializer(slam).data, status=status.HTTP_201_CREATED)


class SlamDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Slam.objects.active().filter(author_id=self.request.user.pk)

    def get_serializer_class(self):
        if self.request.method in {"GET"}:
            return SlamReadSerializer
        return SlamWriteSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance,
            data=request.data,
            partial=partial,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        slam = serializer.save()
        return Response(SlamReadSerializer(slam).data)

    def patch(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        slam = self.get_object()
        slam.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminSlamListView(APIView):
    permission_classes = [IsAdminUser]

    def get_queryset(self, request):
        queryset = Slam.objects.all()

        deleted = request.query_params.get("deleted")
        if deleted == "true":
            queryset = queryset.deleted()
        elif deleted == "false":
            queryset = queryset.active()

        status_value = request.query_params.get("status")
        if status_value in {Slam.Status.DRAFT, Slam.Status.SUBMITTED}:
            queryset = queryset.filter(status=status_value)

        search = request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(author_name_snapshot__icontains=search)
                | Q(author_email_snapshot__icontains=search)
                | Q(author_roll_number_snapshot__icontains=search)
                | Q(what_do_you_think__icontains=search)
                | Q(how_would_you_describe__icontains=search)
                | Q(best_memory__icontains=search)
                | Q(suggestions_or_message__icontains=search)
            )

        ordering_map = {
            "submitted_at": "submitted_at",
            "-submitted_at": "-submitted_at",
            "updated_at": "updated_at",
            "-updated_at": "-updated_at",
            "writer": "author_name_snapshot",
            "-writer": "-author_name_snapshot",
        }
        ordering = ordering_map.get(request.query_params.get("ordering", "-updated_at"), "-updated_at")
        return queryset.order_by(ordering)

    def get(self, request):
        queryset = self.get_queryset(request)
        serializer = AdminSlamSerializer(queryset, many=True)
        base_queryset = Slam.objects.all()

        return Response(
            {
                "results": serializer.data,
                "meta": {
                    "count": queryset.count(),
                    "total": base_queryset.count(),
                    "deleted": base_queryset.deleted().count(),
                    "active": base_queryset.active().count(),
                    "drafts": base_queryset.filter(status=Slam.Status.DRAFT).count(),
                    "submitted": base_queryset.filter(status=Slam.Status.SUBMITTED).count(),
                },
            }
        )
