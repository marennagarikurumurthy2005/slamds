from django.db import connection
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView


class WakeupView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        database_status = "unavailable"

        try:
            connection.database.command("ping")
            database_status = "ready"
        except Exception:
            # The wakeup route should never block the app if the database
            # needs a little longer to become reachable.
            database_status = "warming"

        return Response(
            {
                "service": "mk-slam-collector-api",
                "status": "awake",
                "database": database_status,
                "timestamp": timezone.now(),
            }
        )
