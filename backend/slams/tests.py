from bson import ObjectId
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from accounts.models import User
from slams.models import Slam
from slams.serializers import AdminSlamSerializer, SlamReadSerializer


class SlamSerializerTests(TestCase):
    def setUp(self):
        self.author = User(
            full_name="Kurumurthy M",
            email="mk@example.com",
            roll_number="22S11A6724",
        )
        self.author.pk = ObjectId()

        self.slam = Slam(
            author=self.author,
            author_name_snapshot=self.author.full_name,
            author_email_snapshot=self.author.email,
            author_roll_number_snapshot=self.author.roll_number,
            what_do_you_think="Thoughtful and kind.",
            how_would_you_describe="Reliable friend.",
            best_memory="Class trip.",
            suggestions_or_message="Stay awesome.",
            status=Slam.Status.DRAFT,
        )
        self.slam.pk = ObjectId()

    def test_slam_read_serializer_returns_string_id(self):
        data = SlamReadSerializer(self.slam).data

        self.assertEqual(data["id"], str(self.slam.pk))
        self.assertTrue(data["can_edit"])

    def test_admin_slam_serializer_returns_string_id(self):
        data = AdminSlamSerializer(self.slam).data

        self.assertEqual(data["id"], str(self.slam.pk))
        self.assertEqual(data["writer_name"], "Kurumurthy M")

    def test_submitted_slam_still_returns_can_edit(self):
        self.slam.status = Slam.Status.SUBMITTED

        data = SlamReadSerializer(self.slam).data

        self.assertTrue(data["can_edit"])


class SlamUpdateFlowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="writer@example.com",
            password="Writer1234",
            full_name="Writer User",
            roll_number="22S11A6725",
        )
        self.client.force_authenticate(user=self.user)

    def test_user_can_update_a_submitted_slam(self):
        slam = Slam.objects.create(
            author=self.user,
            author_name_snapshot=self.user.full_name,
            author_email_snapshot=self.user.email,
            author_roll_number_snapshot=self.user.roll_number,
            what_do_you_think="Original thought.",
            how_would_you_describe="Original description.",
            best_memory="Original memory.",
            suggestions_or_message="Original message.",
            status=Slam.Status.SUBMITTED,
        )
        original_submitted_at = slam.submitted_at

        response = self.client.patch(
            f"/api/v1/slams/{slam.pk}/",
            {
                "what_do_you_think": "Updated thought.",
                "suggestions_or_message": "Updated message.",
                "status": Slam.Status.SUBMITTED,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        slam.refresh_from_db()
        self.assertEqual(slam.status, Slam.Status.SUBMITTED)
        self.assertEqual(slam.what_do_you_think, "Updated thought.")
        self.assertEqual(slam.suggestions_or_message, "Updated message.")
        self.assertIsNotNone(slam.submitted_at)
        self.assertNotEqual(slam.submitted_at, original_submitted_at)
        self.assertTrue(response.data["can_edit"])

    def test_user_can_submit_with_only_two_sections(self):
        response = self.client.post(
            "/api/v1/slams/",
            {
                "what_do_you_think": "MK is genuine and memorable.",
                "suggestions_or_message": "Stay bold and keep growing.",
                "status": Slam.Status.SUBMITTED,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        slam = Slam.objects.get(author=self.user)
        self.assertEqual(slam.what_do_you_think, "MK is genuine and memorable.")
        self.assertEqual(slam.suggestions_or_message, "Stay bold and keep growing.")
        self.assertEqual(slam.how_would_you_describe, "")
        self.assertEqual(slam.best_memory, "")

    def test_user_still_sees_their_slams_after_admin_changes_password(self):
        user_slam = Slam.objects.create(
            author=self.user,
            author_name_snapshot=self.user.full_name,
            author_email_snapshot=self.user.email,
            author_roll_number_snapshot=self.user.roll_number,
            what_do_you_think="Existing slam from the user.",
            suggestions_or_message="Helpful suggestion.",
            status=Slam.Status.SUBMITTED,
        )
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="Admin1234",
            full_name="Admin User",
            roll_number="ADMIN001",
        )

        admin_client = APIClient()
        admin_client.force_authenticate(user=admin)
        reset_response = admin_client.post(
            f"/api/v1/auth/admin/users/{self.user.pk}/reset-password/",
            {"new_password": "FreshWriter123"},
            format="json",
        )
        self.assertEqual(reset_response.status_code, status.HTTP_200_OK)

        login_client = APIClient()
        login_response = login_client.post(
            "/api/v1/auth/login/",
            {
                "email": self.user.email,
                "password": "FreshWriter123",
            },
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        access_token = login_response.data["access_token"]
        login_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
        slams_response = login_client.get("/api/v1/slams/")

        self.assertEqual(slams_response.status_code, status.HTTP_200_OK)
        self.assertEqual(slams_response.data["meta"]["count"], 1)
        self.assertEqual(slams_response.data["results"][0]["id"], str(user_slam.pk))
