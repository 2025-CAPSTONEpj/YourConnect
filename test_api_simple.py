#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
간단한 API 테스트 스크립트
"""
import requests
import json
import sys
import os

# Django 설정 로드
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_platform.settings')
import django
django.setup()

API_BASE = "http://localhost:8000/api"

def test_email_api():
    """테스트 이메일 API 호출"""
    print("\n🔷 테스트 이메일 API 호출 중...")
    try:
        response = requests.post(
            f"{API_BASE}/test-email/",
            headers={"Content-Type": "application/json"},
            json={}
        )
        
        print(f"  상태 코드: {response.status_code}")
        print(f"  응답: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ 성공: {data}")
        else:
            print(f"  ❌ 실패")
            
    except Exception as e:
        print(f"  ❌ 오류: {e}")
        import traceback
        traceback.print_exc()

def test_crawl_api():
    """크롤링 API 호출"""
    print("\n🔷 크롤링 API 호출 중...")
    
    request_data = {
        "duty": "개발",
        "subDuties": ["FE"],
        "career": "1년~3년",
        "regions": ["서울"]
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/crawl-send-now/",
            headers={"Content-Type": "application/json"},
            json=request_data
        )
        
        print(f"  상태 코드: {response.status_code}")
        print(f"  응답: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ 성공: {data}")
        else:
            print(f"  ❌ 실패")
            
    except Exception as e:
        print(f"  ❌ 오류: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("=" * 50)
    print("API 테스트 시작")
    print("=" * 50)
    
    test_email_api()
    test_crawl_api()
    
    print("\n" + "=" * 50)
    print("테스트 완료")
    print("=" * 50)
