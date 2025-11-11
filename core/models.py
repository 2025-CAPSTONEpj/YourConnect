from django.db import models
# Create your models here.
from django.contrib.auth.models import AbstractUser


# ✅ 1️⃣ 사용자 기본 정보 (USER)
class User(AbstractUser):
    ROLE_CHOICES = [
        ('멘토', '멘토'),
        ('멘티', '멘티'),
        ('기업', '기업'),
    ]
    LOGIN_CHOICES = [
        ('일반', '일반'),
        ('카카오', '카카오'),
        ('네이버', '네이버'),
    ]
    STATUS_CHOICES = [
        ('활성', '활성'),
        ('탈퇴', '탈퇴'),
    ]

    # Django 기본 username/email 구조 확장
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='멘티')
    phone = models.CharField(max_length=20, blank=True, null=True)
    resume_link = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    field = models.CharField(max_length=100, blank=True, null=True)
    rating_avg = models.FloatField(default=0)
    total_reviews = models.IntegerField(default=0)
    membership = models.ForeignKey('Membership', on_delete=models.SET_NULL, null=True, blank=True)
    join_date = models.DateTimeField(auto_now_add=True)
    login_type = models.CharField(max_length=10, choices=LOGIN_CHOICES, default='일반')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='활성')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.username} ({self.role})"


# ✅ 2️⃣ 멤버십 요금제 (MEMBERSHIP)
class Membership(models.Model):
    STATUS_CHOICES = [
        ('활성', '활성'),
        ('비활성', '비활성'),
    ]
    name = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    benefits = models.TextField(blank=True, null=True)
    duration_month = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='활성')

    def __str__(self):
        return self.name


# ✅ 3️⃣ 경력 정보 (EXPERIENCE)
class Experience(models.Model):
    CAREER_TYPE_CHOICES = [
        ('정규직', '정규직'),
        ('인턴', '인턴'),
        ('프로젝트', '프로젝트'),
        ('기타', '기타'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    company = models.CharField(max_length=100)
    role = models.CharField(max_length=100)
    career_type = models.CharField(max_length=20, choices=CAREER_TYPE_CHOICES, blank=True, null=True)
    skills = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.company} - {self.role}"


# ✅ 4️⃣ 채팅방 (CHAT)
class Chat(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Chat #{self.id}"


# ✅ 5️⃣ 채팅 참여자 (CHAT_PARTICIPANT)
class ChatParticipant(models.Model):
    ROLE_CHOICES = [
        ('멘토', '멘토'),
        ('멘티', '멘티'),
    ]
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('chat', 'user')  # 복합키

    def __str__(self):
        return f"{self.user.username} in Chat {self.chat.id}"


# ✅ 6️⃣ 채팅 메시지 (CHAT_MESSAGE)
class ChatMessage(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender.username} ({self.chat.id})"


# ✅ 7️⃣ AI 피드백 로그 (AI_FEEDBACK)
class AiFeedback(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    input_text = models.TextField()
    ai_response = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"AI Feedback - {self.user.username}"


# ✅ 8️⃣ 멘토링 예약 (MENTOR_SESSION) — duration 제거 반영
class MentorSession(models.Model):
    STATUS_CHOICES = [
        ('예약', '예약'),
        ('완료', '완료'),
        ('취소', '취소'),
    ]
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentor_sessions')
    mentee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentee_sessions')
    schedule_time = models.DateTimeField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='예약')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session {self.id} ({self.mentor.username} ↔ {self.mentee.username})"


# ✅ 9️⃣ 채용공고 (JOB_POST)
class JobPost(models.Model):
    STATUS_CHOICES = [
        ('모집중', '모집중'),
        ('마감', '마감'),
        ('비공개', '비공개'),
    ]
    JOB_TYPE_CHOICES = [
        ('정규직', '정규직'),
        ('인턴', '인턴'),
        ('계약직', '계약직'),
        ('프리랜서', '프리랜서'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # 기업만 가능
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    job_type = models.CharField(max_length=20, choices=JOB_TYPE_CHOICES, default='정규직')
    location = models.CharField(max_length=100, blank=True, null=True)
    salary = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField()
    skills = models.TextField(blank=True, null=True)
    deadline = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='모집중')

    def __str__(self):
        return f"{self.title} ({self.company})"


# ✅ 🔟 채용 지원 내역 (JOB_APPLICATION)
class JobApplication(models.Model):
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    resume_link = models.URLField(blank=True, null=True)
    cover_letter = models.TextField(blank=True, null=True)
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} → {self.job.title}"


# ✅ 11. 공고 북마크 (JOB_BOOKMARK)
class JobBookmark(models.Model):
    job = models.ForeignKey(JobPost, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('job', 'user')

    def __str__(self):
        return f"{self.user.username} bookmarked {self.job.title}"

# ✅ 12. 옵션 (OPTION)   
class Option(models.Model):
    CATEGORY_CHOICES = [
        ('직급', '직급'),
        ('경력', '경력'),
        ('직무', '직무'),
        ('기업형태', '기업형태'),
        ('근무지역', '근무지역'),
    ]
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    value = models.CharField(max_length=100)

    def __str__(self):
        return f"[{self.category}] {self.value}"

# ✅ 13. 사용자 선택 옵션 (USER_SELECTION)
class UserSelection(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    option = models.ForeignKey(Option, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username} - {self.option.value}"

