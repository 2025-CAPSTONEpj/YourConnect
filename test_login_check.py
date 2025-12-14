#!/usr/bin/env python
"""
현재 로그인된 사용자 확인 테스트
Django 서버를 통해 현재 누가 로그인되어 있는지 확인합니다.
"""
import os
import sys
import django
import requests
from requests.cookies import RequestsCookieJar

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_platform.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.auth.models import User

print("=" * 60)
print("📊 현재 로그인된 사용자 확인")
print("=" * 60)

# 1. 데이터베이스의 모든 사용자 확인
print("\n✅ 데이터베이스에 등록된 모든 사용자:")
for user in User.objects.all():
    print(f"  - {user.username} → {user.email}")

# 2. API를 통해 현재 로그인 상태 확인 (세션 방식)
print("\n📡 API를 통한 로그인 상태 확인을 위해:")
print("  1. 브라우저에서 http://localhost:3001 접속")
print("  2. aksux01992 계정으로 로그인")
print("  3. 헤드헌팅 페이지에서 '이메일로 결과 받기' 버튼 클릭")
print("  4. Django 로그를 확인하여 어떤 사용자가 요청했는지 확인")

print("\n" + "=" * 60)
