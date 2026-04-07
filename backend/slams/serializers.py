from django.utils import timezone
from rest_framework import serializers

from slams.models import Slam


SLAM_REQUIRED_SECTION_LABELS = {
    "what_do_you_think": "Write slam",
    "suggestions_or_message": "Suggest for my better version",
}


class SlamReadSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()

    class Meta:
        model = Slam
        fields = (
            "id",
            "what_do_you_think",
            "how_would_you_describe",
            "best_memory",
            "suggestions_or_message",
            "status",
            "submitted_at",
            "created_at",
            "updated_at",
            "can_edit",
        )

    def get_id(self, obj):
        return str(obj.pk)

    def get_can_edit(self, obj):
        return not obj.is_deleted


class SlamWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Slam
        fields = (
            "what_do_you_think",
            "how_would_you_describe",
            "best_memory",
            "suggestions_or_message",
            "status",
        )

    def validate(self, attrs):
        instance = self.instance

        for field in (
            "what_do_you_think",
            "how_would_you_describe",
            "best_memory",
            "suggestions_or_message",
        ):
            if field in attrs and attrs[field] is not None:
                attrs[field] = attrs[field].strip()

        target_status = attrs.get("status")
        if not target_status and instance:
            target_status = instance.status
        if not target_status:
            target_status = Slam.Status.DRAFT

        # Once a slam has been submitted, later edits update the same submitted record.
        if instance and instance.status == Slam.Status.SUBMITTED:
            target_status = Slam.Status.SUBMITTED
            attrs["status"] = Slam.Status.SUBMITTED

        if target_status == Slam.Status.SUBMITTED:
            merged_values = {
                field: attrs.get(field, getattr(instance, field, "") if instance else "")
                for field in SLAM_REQUIRED_SECTION_LABELS
            }
            missing_fields = [
                label
                for field, label in SLAM_REQUIRED_SECTION_LABELS.items()
                if not merged_values[field].strip()
            ]
            if missing_fields:
                raise serializers.ValidationError(
                    {
                        "detail": "Both slam sections must be completed before submitting.",
                        "missing_fields": missing_fields,
                    }
                )

        return attrs

    def create(self, validated_data):
        author = validated_data["author"]
        slam = Slam(**validated_data)
        slam.refresh_author_snapshot()
        if slam.status == Slam.Status.SUBMITTED and not slam.submitted_at:
            slam.submitted_at = timezone.now()
        slam.save()
        return slam

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.refresh_author_snapshot()
        if instance.status == Slam.Status.SUBMITTED:
            instance.submitted_at = timezone.now()
        else:
            instance.submitted_at = None

        instance.save()
        return instance


class AdminSlamSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    writer_name = serializers.CharField(source="author_name_snapshot", read_only=True)
    writer_email = serializers.CharField(source="author_email_snapshot", read_only=True)
    writer_roll_number = serializers.CharField(source="author_roll_number_snapshot", read_only=True)

    class Meta:
        model = Slam
        fields = (
            "id",
            "writer_name",
            "writer_email",
            "writer_roll_number",
            "what_do_you_think",
            "how_would_you_describe",
            "best_memory",
            "suggestions_or_message",
            "status",
            "is_deleted",
            "deleted_at",
            "submitted_at",
            "created_at",
            "updated_at",
        )

    def get_id(self, obj):
        return str(obj.pk)
