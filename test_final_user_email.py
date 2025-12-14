#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
최종 테스트: aksux0199@gmail.com으로 이메일 발송 확인
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_platform.settings')

import django
django.setup()

from django.core.mail import send_mail
from core.models import User
from core.crawler import generate_email_html
from datetime import datetime

print("\n" + "=" * 70)
print("🎯 최종 테스트: 로그인 사용자 이메일로 발송")
print("=" * 70 + "\n")

# aksux0199@gmail.com 사용자 찾기
try:
    user = User.objects.get(email='aksux0199@gmail.com')
    print(f"✅ 사용자 찾음")
    print(f"   사용자명: {user.username}")
    print(f"   📧 이메일: {user.email}")
except User.DoesNotExist:
    print("❌ aksux0199@gmail.com 사용자를 찾을 수 없습니다.")
    print("   먼저 aksux01992 계정으로 로그인하거나 새 계정을 생성하세요.")
    exit(1)

# 테스트 데이터
test_jobs = [
    {
        "title": "🚀 Senior React Developer",
        "company": "당신을 기다리는 스타트업",
        "location": "서울 강남구",
        "deadline": "2025-12-31",
        "link": "https://example.com/job/1",
        "salary": "5500만원 ~",
        "career": "3년 이상"
    },
    {
        "title": "⚙️ Backend Engineer (Python/Django)",
        "company": "성장하는 핀테크",
        "location": "경기도 성남시",
        "deadline": "2025-12-25",
        "link": "https://example.com/job/2",
        "salary": "4800만원 ~",
        "career": "2년 이상"
    },
    {
        "title": "🌐 Full Stack Developer",
        "company": "혁신적인 스타트업",
        "location": "서울 마포구",
        "deadline": "2025-12-20",
        "link": "https://example.com/job/3",
        "salary": "3500만원 ~ 5000만원",
        "career": "1년 이상"
    }
]

print(f"📊 준비된 데이터:")
print(f"   공고 수: {len(test_jobs)}개")

try:
    print(f"\n📧 이메일 생성 중...", end="", flush=True)
    html_content = generate_email_html(user, test_jobs)
    print(" 완료!")
    
    print(f"📤 Gmail SMTP로 발송 중...", end="", flush=True)
    result = send_mail(
        subject="[YourConnect 발표] 검색 결과입니다! ✨",
        message="이메일을 HTML 형식으로 확인하세요.",
        from_email="yourconnect100@gmail.com",
        recipient_list=[user.email],
        html_message=html_content,
        fail_silently=False
    )
    print(" 완료!")
    
    if result == 1:
        print(f"\n✅ 이메일 발송 성공!")
        print("=" * 70)
        print(f"\n📧 발송 정보:")
        print(f"   발송 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"   발송자: yourconnect100@gmail.com")
        print(f"   수신자: {user.email}")
        print(f"   제목: [YourConnect 발표] 검색 결과입니다! ✨")
        print(f"   공고: {len(test_jobs)}개")
        print(f"\n📥 수신 예상 시간: 1~2분")
        print(f"💡 {user.email}에서 받은 메일을 확인하세요!")
        print("\n" + "=" * 70)
        print("🎉 발표 준비 완료!")
        print("=" * 70 + "\n")
    else:
        print(f"\n❌ 발송 실패 (결과코드: {result})")
        exit(1)
        
except Exception as e:
    print(f" 오류!")
    print(f"❌ {e}")
    import traceback
    traceback.print_exc()
    exit(1)
