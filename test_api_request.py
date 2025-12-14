#!/usr/bin/env python
import requests
import json
import os
import sys

# Django 설정 로드
sys.path.insert(0, os.path.dirname(__file__))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_platform.settings')

import django
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

# 첫 번째 사용자 정보 가져오기
user = User.objects.first()
if not user:
    print("❌ 사용자 없음")
    sys.exit(1)

# 로그인 후 토큰 생성
print(f"📝 테스트 사용자: {user.username} ({user.email})")

# API 호출
API_URL = "http://localhost:8000/api/crawl-send-now/"
headers = {
    "Content-Type": "application/json",
}

payload = {
    "duty": "개발",
    "subDuties": ["FE"],
    "career": "1년~3년",
    "regions": ["서울"]
}

print(f"\n📤 API 요청 전송: {API_URL}")
print(f"  페이로드: {json.dumps(payload, indent=2, ensure_ascii=False)}")

try:
    # 세션 쿠키로 요청 (로그인된 상태 시뮬레이션)
    session = requests.Session()
    
    # Django test client 방식으로 요청
    from django.test import Client
    client = Client()
    
    # 사용자 로그인 강제 (test client)
    from django.contrib.sessions.models import Session as DjangoSession
    from django.utils import timezone
    
    # 임시로 로그인 없이 요청해보기
    response = requests.post(
        API_URL,
        json=payload,
        headers=headers,
        timeout=30
    )
    
    print(f"\n📥 응답 상태: {response.status_code}")
    print(f"📄 응답 내용:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    
except Exception as e:
    print(f"❌ 오류: {e}")
    import traceback
    traceback.print_exc()
