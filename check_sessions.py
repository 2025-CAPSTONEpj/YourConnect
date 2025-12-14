#!/usr/bin/env python
"""
현재 세션 정보 확인 및 관리자 계정 자동 로그아웃
"""
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_platform.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.sessions.models import Session
from django.contrib.auth.models import User
from django.utils import timezone
import pickle

print("=" * 70)
print("🔍 현재 모든 세션 정보")
print("=" * 70)

active_sessions = Session.objects.filter(expire_date__gte=timezone.now())

print(f"\n✅ 활성 세션 개수: {active_sessions.count()}개\n")

for session in active_sessions:
    try:
        session_data = session.get_decoded()
        user_id = session_data.get('_auth_user_id')
        
        if user_id:
            user = User.objects.get(id=user_id)
            print(f"  📌 세션 ID: {session.session_key[:20]}...")
            print(f"     사용자: {user.username} ({user.email})")
            print(f"     만료: {session.expire_date}")
            print()
    except Exception as e:
        print(f"  ⚠️ 세션 디코딩 오류: {e}\n")

# 모든 관리자 계정 확인
print("\n" + "=" * 70)
print("👥 현재 등록된 모든 사용자")
print("=" * 70)
for user in User.objects.all():
    print(f"  - {user.username} ({user.email})")

print("\n" + "=" * 70)
