#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
현재 로그인한 사용자의 이메일 주소 확인
"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_platform.settings')

import django
django.setup()

from core.models import User

print("\n" + "=" * 70)
print("👤 등록된 모든 사용자")
print("=" * 70)

users = User.objects.all()

if not users.exists():
    print("❌ 등록된 사용자가 없습니다.")
else:
    for i, user in enumerate(users, 1):
        print(f"\n{i}. {user.username}")
        print(f"   📧 이메일: {user.email}")
        print(f"   ✅ 활성화: {user.is_active}")
        print(f"   🔐 관리자: {user.is_staff}")
        print(f"   📅 가입일: {user.date_joined.strftime('%Y-%m-%d %H:%M:%S')}")

print("\n" + "=" * 70)
print(f"총 {users.count()}명의 사용자가 등록되어 있습니다.")
print("=" * 70 + "\n")

# 사용자 추가 안내
print("💡 새로운 계정을 만들려면:")
print("   python manage.py createsuperuser")
print("   또는")
print("   python manage.py shell")
print("   >>> from core.models import User")
print("   >>> User.objects.create_user('username', 'email@example.com', 'password')")
print()
