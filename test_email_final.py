#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
최종 통합 테스트: 실제 이메일 발송 확인
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_platform.settings')

import django
django.setup()

from django.core.mail import send_mail
from core.models import User
from core.crawler import generate_email_html

print("\n" + "=" * 60)
print("📧 최종 이메일 발송 테스트")
print("=" * 60)

# 첫 번째 사용자 찾기
user = User.objects.first()

if not user:
    print("❌ 사용자 없음")
    exit(1)

print(f"👤 사용자: {user.email}")

# 테스트 데이터
test_jobs = [
    {
        "title": "Senior React Developer",
        "company": "Tech Company A",
        "location": "서울",
        "deadline": "2025-12-31",
        "link": "https://example.com/job/1",
        "salary": "5000만원 ~",
        "career": "3년 이상"
    },
    {
        "title": "Backend Engineer (Python)",
        "company": "Tech Company B",
        "location": "경기도",
        "deadline": "2025-12-25",
        "link": "https://example.com/job/2",
        "salary": "4500만원 ~",
        "career": "2년 이상"
    },
    {
        "title": "Full Stack Developer",
        "company": "Startup C",
        "location": "서울",
        "deadline": "2025-12-20",
        "link": "https://example.com/job/3",
        "salary": "3500만원 ~",
        "career": "1년 이상"
    }
]

try:
    print(f"\n📤 이메일 발송 중... (수신자: {user.email})")
    
    # 이메일 HTML 생성
    html_content = generate_email_html(user, test_jobs)
    
    # 이메일 발송
    result = send_mail(
        subject="[YourConnect] 검색 결과가 도착했습니다!",
        message="이메일을 HTML 형식으로 확인하세요.",
        from_email="yourconnect100@gmail.com",
        recipient_list=[user.email],
        html_message=html_content,
        fail_silently=False
    )
    
    print(f"✅ 이메일 발송 성공!")
    print(f"   결과 코드: {result}")
    print(f"\n📧 총 {len(test_jobs)}개의 공고를 포함한 이메일이 발송되었습니다.")
    print(f"   수신자: {user.email}")
    print(f"   상태: 완료")
    
except Exception as e:
    print(f"❌ 오류 발생: {e}")
    import traceback
    traceback.print_exc()
    exit(1)

print("\n" + "=" * 60)
print("✅ 테스트 완료!")
print("=" * 60)
