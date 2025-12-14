#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
YourConnect 이메일 기능 데모
발표용 스크립트 - 모든 기능 동시 테스트
"""
import os
import sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_platform.settings')

import django
django.setup()

from django.core.mail import send_mail
from core.models import User
from core.crawler import generate_email_html
import time

def print_header(text):
    print("\n" + "=" * 70)
    print(f"  {text}")
    print("=" * 70)

def print_success(text):
    print(f"✅ {text}")

def print_error(text):
    print(f"❌ {text}")

def print_info(text):
    print(f"ℹ️  {text}")

def print_step(step_num, text):
    print(f"\n[{step_num}] {text}")
    print("-" * 70)

def demo_test_jobs():
    """테스트용 구직 공고 데이터"""
    return [
        {
            "title": "Senior React Developer (풀타임)",
            "company": "당신을 기다리는 스타트업 A",
            "location": "서울 강남구",
            "deadline": "2025-12-31",
            "link": "https://example.com/job/1",
            "salary": "5500만원 ~",
            "career": "3년 이상",
            "position": "Frontend Lead"
        },
        {
            "title": "Backend Engineer - Python/Django",
            "company": "성장하는 핀테크 B",
            "location": "경기도 성남시",
            "deadline": "2025-12-25",
            "link": "https://example.com/job/2",
            "salary": "4800만원 ~",
            "career": "2년 이상",
            "position": "Backend Engineer"
        },
        {
            "title": "Full Stack Developer",
            "company": "혁신적인 스타트업 C",
            "location": "서울 마포구",
            "deadline": "2025-12-20",
            "link": "https://example.com/job/3",
            "salary": "3500만원 ~ 5000만원",
            "career": "1년 이상",
            "position": "Full Stack Developer"
        },
        {
            "title": "DevOps Engineer",
            "company": "글로벌 IT 기업 D",
            "location": "서울 여의도",
            "deadline": "2025-12-15",
            "link": "https://example.com/job/4",
            "salary": "5200만원 ~",
            "career": "2년 이상",
            "position": "DevOps/SRE"
        }
    ]

def main():
    print_header("🎉 YourConnect 이메일 기능 데모")
    
    print("""
    이 스크립트는 YourConnect 이메일 시스템의 모든 기능을 테스트합니다.
    
    테스트 항목:
    1. Django 설정 확인
    2. 사용자 데이터 조회
    3. 구직 정보 수집
    4. HTML 이메일 생성
    5. Gmail SMTP 발송
    6. 최종 결과 확인
    """)
    
    print_step(1, "Django 설정 확인")
    try:
        from django.conf import settings
        print_info(f"프로젝트 경로: {settings.BASE_DIR}")
        print_info(f"DEBUG 모드: {settings.DEBUG}")
        print_info(f"이메일 백엔드: {settings.EMAIL_BACKEND}")
        print_info(f"SMTP 호스트: {settings.EMAIL_HOST}:{settings.EMAIL_PORT}")
        print_info(f"SMTP TLS: {settings.EMAIL_USE_TLS}")
        print_success("Django 설정 정상")
    except Exception as e:
        print_error(f"Django 설정 오류: {e}")
        return False
    
    print_step(2, "사용자 데이터 조회")
    try:
        user = User.objects.first()
        if not user:
            print_error("등록된 사용자 없음")
            return False
        print_info(f"사용자명: {user.username}")
        print_info(f"이메일: {user.email}")
        print_info(f"가입일: {user.date_joined.strftime('%Y-%m-%d')}")
        print_success(f"사용자 조회 성공 ({user.email})")
    except Exception as e:
        print_error(f"사용자 조회 실패: {e}")
        return False
    
    print_step(3, "구직 정보 수집")
    try:
        test_jobs = demo_test_jobs()
        print_info(f"수집된 공고 수: {len(test_jobs)}")
        for i, job in enumerate(test_jobs, 1):
            print_info(f"  {i}. {job['title']} @ {job['company']}")
        print_success(f"총 {len(test_jobs)}개 공고 준비 완료")
    except Exception as e:
        print_error(f"구직 정보 수집 실패: {e}")
        return False
    
    print_step(4, "HTML 이메일 템플릿 생성")
    try:
        html_content = generate_email_html(user, test_jobs)
        if not html_content or len(html_content) < 100:
            raise ValueError("HTML 콘텐츠가 너무 짧음")
        print_info(f"생성된 HTML 크기: {len(html_content)} bytes")
        print_info(f"포함된 공고 링크: {html_content.count('example.com')}")
        print_success("HTML 이메일 템플릿 생성 완료")
    except Exception as e:
        print_error(f"HTML 생성 실패: {e}")
        return False
    
    print_step(5, "Gmail SMTP 이메일 발송")
    try:
        print_info(f"발송자: {settings.EMAIL_HOST_USER}")
        print_info(f"수신자: {user.email}")
        print_info(f"제목: [YourConnect] 검색 결과가 도착했습니다!")
        print_info(f"첨부 공고 수: {len(test_jobs)}")
        
        print("\n📧 이메일 발송 중...", end="", flush=True)
        time.sleep(0.5)
        
        result = send_mail(
            subject="[YourConnect] 검색 결과가 도착했습니다! 🎉",
            message="이메일을 HTML 형식으로 확인하세요.",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user.email],
            html_message=html_content,
            fail_silently=False
        )
        
        if result != 1:
            raise ValueError(f"예상치 못한 결과: {result}")
        
        print(" 완료!")
        print_success("Gmail SMTP 발송 성공")
        
    except Exception as e:
        print_error(f"이메일 발송 실패: {e}")
        import traceback
        traceback.print_exc()
        return False
    
    print_step(6, "최종 결과 확인")
    try:
        print_info(f"발송된 이메일 수: 1개")
        print_info(f"수신자: {user.email}")
        print_info(f"포함된 공고: {len(test_jobs)}개")
        print_info(f"이메일 형식: HTML (CSS 포함)")
        print_info(f"상태: 정상 발송됨 ✓")
        print_success("최종 결과 확인 완료")
    except Exception as e:
        print_error(f"결과 확인 실패: {e}")
        return False
    
    # 최종 요약
    print_header("🎊 모든 테스트 성공!")
    
    print(f"""
    ✅ 테스트 항목 완료:
       1. Django 설정 확인: ✓
       2. 사용자 데이터 조회: ✓
       3. 구직 정보 수집: ✓
       4. HTML 이메일 생성: ✓
       5. Gmail SMTP 발송: ✓
       6. 최종 결과 확인: ✓
    
    📧 이메일 정보:
       - 수신자: {user.email}
       - 공고 수: {len(test_jobs)}개
       - 발송 상태: 완료 ✓
       - 예상 도착: 1-2분 이내
    
    🚀 다음 단계:
       1. {user.email} 이메일 함수 확인
       2. Headhunting 페이지에서 버튼 클릭 테스트
       3. React 프론트엔드와 Django 백엔드 통합 테스트
    
    🎉 발표 준비 완료!
    """)
    
    return True

if __name__ == "__main__":
    print_header("YourConnect 이메일 시스템 - 데모 시작")
    success = main()
    
    if not success:
        print_header("❌ 테스트 실패")
        sys.exit(1)
    else:
        print_header("✅ 모든 테스트 통과")
        sys.exit(0)
