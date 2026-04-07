from bson import ObjectId
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from accounts.serializers import AdminUserSerializer, UserSerializer
from slams.models import Slam


class UserSerializerTests(TestCase):
    def setUp(self):
        self.user = User(
            full_name="Kurumurthy M",
            email="mk@example.com",
            roll_number="22S11A6724",
            is_staff=True,
            is_superuser=True,
        )
        self.user.pk = ObjectId()

    def test_user_serializer_returns_string_id(self):
        data = UserSerializer(self.user).data

        self.assertEqual(data["id"], str(self.user.pk))
        self.assertEqual(data["name"], "Kurumurthy M")
        self.assertTrue(data["is_admin"])

    def test_admin_user_serializer_returns_string_id(self):
        data = AdminUserSerializer(self.user).data

        self.assertEqual(data["id"], str(self.user.pk))
        self.assertEqual(data["email"], "mk@example.com")


class SignupViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_signup_returns_string_id(self):
        response = self.client.post(
            "/api/v1/auth/signup/",
            {
                "name": "Kurumurthy M",
                "email": "mk-signup@example.com",
                "roll_number": "22S11A6724",
                "password": "Murthy123",
                "confirm_password": "Murthy123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertIsInstance(response.data["user"]["id"], str)
        self.assertEqual(response.data["user"]["email"], "mk-signup@example.com")


class AdminUserListViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email="admin@example.com",
            password="Admin1234",
            full_name="Admin User",
            roll_number="ADMIN001",
        )
        self.user = User.objects.create_user(
            email="writer@example.com",
            password="Writer1234",
            full_name="Writer User",
            roll_number="22S11A6725",
        )

    def test_admin_user_list_excludes_superuser_accounts(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.get("/api/v1/auth/admin/users/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["meta"]["count"], 1)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["email"], "writer@example.com")


class AdminUserDetailViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email="admin@example.com",
            password="Admin1234",
            full_name="Admin User",
            roll_number="ADMIN001",
        )
        self.user = User.objects.create_user(
            email="writer@example.com",
            password="Writer1234",
            full_name="Writer User",
            roll_number="22S11A6725",
        )

        Slam.objects.create(
            author=self.user,
            author_name_snapshot=self.user.full_name,
            author_email_snapshot=self.user.email,
            author_roll_number_snapshot=self.user.roll_number,
            what_do_you_think="Great person.",
            how_would_you_describe="Helpful.",
            best_memory="Class project.",
            suggestions_or_message="Keep shining.",
            status=Slam.Status.DRAFT,
        )
        Slam.objects.create(
            author=self.user,
            author_name_snapshot=self.user.full_name,
            author_email_snapshot=self.user.email,
            author_roll_number_snapshot=self.user.roll_number,
            what_do_you_think="Calm and creative.",
            how_would_you_describe="Friendly.",
            best_memory="Lunch break.",
            suggestions_or_message="Stay confident.",
            status=Slam.Status.SUBMITTED,
        )

    def test_admin_user_detail_returns_stats_and_all_slams(self):
        for index in range(9):
            Slam.objects.create(
                author=self.user,
                author_name_snapshot=self.user.full_name,
                author_email_snapshot=self.user.email,
                author_roll_number_snapshot=self.user.roll_number,
                what_do_you_think=f"Extra thought {index}",
                how_would_you_describe="Consistent.",
                best_memory=f"Memory {index}",
                suggestions_or_message="Keep growing.",
                status=Slam.Status.DRAFT,
            )

        self.client.force_authenticate(user=self.admin)

        response = self.client.get(f"/api/v1/auth/admin/users/{self.user.pk}/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["email"], "writer@example.com")
        self.assertEqual(response.data["stats"]["total_slams"], 11)
        self.assertEqual(response.data["stats"]["draft_slams"], 10)
        self.assertEqual(response.data["stats"]["submitted_slams"], 1)
        self.assertEqual(len(response.data["slams"]), 11)


class AdminResetPasswordViewTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email="admin@example.com",
            password="Admin1234",
            full_name="Admin User",
            roll_number="ADMIN001",
        )
        self.user = User.objects.create_user(
            email="writer@example.com",
            password="Writer1234",
            full_name="Writer User",
            roll_number="22S11A6725",
        )

    def test_admin_can_set_a_custom_password_for_a_user(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            f"/api/v1/auth/admin/users/{self.user.pk}/reset-password/",
            {"new_password": "FreshWriter123"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("FreshWriter123"))
        self.assertEqual(response.data["temporary_password"], "FreshWriter123")

    def test_admin_cannot_change_password_for_superuser_via_user_endpoint(self):
        self.client.force_authenticate(user=self.admin)

        response = self.client.post(
            f"/api/v1/auth/admin/users/{self.admin.pk}/reset-password/",
            {"new_password": "NewAdmin123"},
            format="json",
        )

        self.assertEqual(response.status_code, 404)
