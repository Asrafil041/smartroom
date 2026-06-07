from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Room(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='owned_rooms')
    description = models.TextField(blank=True)
    settings = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class RoomMembership(models.Model):
    ROLE_CHOICES = [("owner", "Owner"), ("member", "Member"), ("guest", "Guest")]
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='room_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    joined_at = models.DateTimeField(auto_now_add=True)
    last_active = models.DateTimeField(blank=True, null=True)


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    extra_data = models.JSONField(blank=True, null=True)


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=64, blank=True, null=True)
    student_class = models.CharField(max_length=128, blank=True, null=True)
    major = models.CharField(max_length=128, blank=True, null=True)


class TeacherProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    staff_id = models.CharField(max_length=64, blank=True, null=True)
    department = models.CharField(max_length=128, blank=True, null=True)


class Progress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    task_id = models.CharField(max_length=128, blank=True, null=True)
    progress_percent = models.FloatField(default=0.0)
    current_step = models.CharField(max_length=128, blank=True, null=True)
    last_updated = models.DateTimeField(auto_now=True)


class Score(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, blank=True, null=True)
    task_id = models.CharField(max_length=128, blank=True, null=True)
    score_value = models.FloatField(default=0.0)
    max_score = models.FloatField(default=0.0)
    graded_at = models.DateTimeField(auto_now_add=True)


class BlocklyResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    problem_id = models.CharField(max_length=128, blank=True, null=True)
    workspace_xml = models.TextField(blank=True, null=True)
    generated_code = models.TextField(blank=True, null=True)
    result = models.CharField(max_length=32, blank=True, null=True)
    output = models.TextField(blank=True, null=True)
    run_time = models.FloatField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Submission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task_id = models.CharField(max_length=128, blank=True, null=True)
    attachment = models.CharField(max_length=1024, blank=True, null=True)
    status = models.CharField(max_length=32, default='pending')
    feedback = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)


class Attempt(models.Model):
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='attempts')
    attempt_no = models.IntegerField(default=1)
    result = models.CharField(max_length=32, blank=True, null=True)
    time_taken = models.FloatField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class SimulationRun(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(blank=True, null=True)
    state_snapshot = models.JSONField(blank=True, null=True)
    score = models.FloatField(blank=True, null=True)


class DeviceState(models.Model):
    device_id = models.CharField(max_length=128)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, blank=True, null=True)
    state = models.JSONField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)


class Asset(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    file_name = models.CharField(max_length=255)
    path = models.CharField(max_length=1024)
    mime_type = models.CharField(max_length=128, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)


class ActivityLog(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, blank=True, null=True)
    action = models.CharField(max_length=128)
    object_type = models.CharField(max_length=128, blank=True, null=True)
    object_id = models.CharField(max_length=128, blank=True, null=True)
    details = models.JSONField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)


class Leaderboard(models.Model):
    name = models.CharField(max_length=128)
    period = models.CharField(max_length=64, blank=True, null=True)
    summary = models.JSONField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)


class Setting(models.Model):
    key = models.CharField(max_length=128, unique=True)
    value = models.JSONField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)


class RoomSetting(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='room_settings')
    key = models.CharField(max_length=128)
    value = models.JSONField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)
