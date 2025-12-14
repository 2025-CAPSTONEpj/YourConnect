#!/usr/bin/env python
import os
import sys
from dotenv import load_dotenv

# .env 로드
load_dotenv()

print("=" * 80)
print("📧 Gmail SMTP 직접 테스트")
print("=" * 80)

EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')

print(f"\n✅ 환경변수 로드:")
print(f"  - EMAIL_HOST_USER: {EMAIL_HOST_USER}")
print(f"  - EMAIL_HOST_PASSWORD: {EMAIL_HOST_PASSWORD[:10] if EMAIL_HOST_PASSWORD else 'NOT SET'}...")

# Django 설정 로드
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_platform.settings')

import django
django.setup()

from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

print(f"\n📌 Django 이메일 설정:")
print(f"  - EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
print(f"  - EMAIL_HOST: {settings.EMAIL_HOST}")
print(f"  - EMAIL_PORT: {settings.EMAIL_PORT}")
print(f"  - EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
print(f"  - EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
print(f"  - DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}")

print(f"\n🔍 사용자 확인:")
users = User.objects.all()
print(f"  - 총 사용자 수: {users.count()}")
for u in users:
    print(f"    - {u.username}: {u.email}")

# 첫 번째 사용자에게 테스트 메일 발송
if users.exists():
    user = users.first()
    print(f"\n📧 테스트 메일 발송 시작 ({user.email})...")
    
    try:
        result = send_mail(
            subject="[CareerPlatform 테스트] 이메일 발송 테스트",
            message="이것은 테스트 메일입니다.",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message="<html><body><h1>🎉 이메일 발송 성공!</h1><p>이 메일이 도착했다면 Gmail SMTP 설정이 정상입니다.</p></body></html>",
            fail_silently=False,
        )
        print(f"✅ 이메일 발송 완료! (반환값: {result})")
    except Exception as e:
        print(f"❌ 이메일 발송 실패: {e}")
        import traceback
        traceback.print_exc()
else:
    print("❌ 등록된 사용자가 없습니다.")
