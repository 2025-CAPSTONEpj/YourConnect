from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from .crawler import run_weekly_crawl, cleanup_old_crawl_files, generate_email_html, crawl_saramin, crawl_groupby
import logging
import os

User = get_user_model()

# 로깅 설정
logger = logging.getLogger(__name__)
log_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'debug_email.log')
handler = logging.FileHandler(log_file, encoding='utf-8')
handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
logger.addHandler(handler)
logger.setLevel(logging.DEBUG)

@shared_task
def weekly_crawl_task():
    """
    Celery가 주기적으로 실행할 비동기 작업.
    - 매주 월요일 오전 9시마다 자동 실행
    - 각 사용자의 스펙(spec_job)을 기반으로 채용 공고 크롤링
    - 크롤링 결과를 이메일로 전송
    """
    print("[🕘] 주간 크롤링 시작")
    
    users = User.objects.all()
    for user in users:
        try:
            # 사용자의 보유 스펙(spec_job) 기반 크롤링
            if not user.spec_job:
                print(f"⚠️ {user.username}: spec_job이 없어 스킵")
                continue
            
            print(f"\n[🔍] {user.username}님을 위한 크롤링 시작 (검색어: {user.spec_job})")
            
            # Saramin + GroupBy에서 공고 수집
            results = []
            try:
                results.extend(crawl_saramin(user.spec_job))
            except Exception as e:
                print(f"⚠️ Saramin 크롤링 오류: {e}")
            
            try:
                results.extend(crawl_groupby(user.spec_job))
            except Exception as e:
                print(f"⚠️ GroupBy 크롤링 오류: {e}")
            
            # 중복 제거
            results = list({r["link"]: r for r in results}.values())
            print(f"✅ 크롤링 완료 → {len(results)}개 공고")
            
            # 이메일로 전송
            if user.email:
                send_crawl_results_email(user, results)
            else:
                print(f"⚠️ {user.username}: 이메일 주소가 없음")
        
        except Exception as e:
            import traceback
            print(f"⚠️ {user.username} 처리 중 오류: {e}")
            print(traceback.format_exc())
    
    print("[✅] 주간 크롤링 완료")
    
    # 크롤링 완료 후 7일 이상 된 파일 자동 삭제
    print("[🧹] 오래된 파일 정리 시작")
    cleanup_old_crawl_files(days_to_keep=7)
    print("[✅] 오래된 파일 정리 완료")


def send_crawl_results_email(user, crawl_results):
    """
    크롤링 결과를 사용자 이메일로 전송
    
    Args:
        user: User 객체
        crawl_results: 크롤링 결과 리스트
    """
    import traceback
    try:
        logger.info(f"\n[📧 이메일 발송 시작]")
        logger.info(f"  - 수신자: {user.email}")
        logger.info(f"  - EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
        logger.info(f"  - EMAIL_HOST: {settings.EMAIL_HOST}")
        logger.info(f"  - EMAIL_PORT: {settings.EMAIL_PORT}")
        logger.info(f"  - EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
        
        print(f"\n[📧 이메일 발송 시작]")
        print(f"  - 수신자: {user.email}")
        print(f"  - EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
        print(f"  - EMAIL_HOST: {settings.EMAIL_HOST}")
        print(f"  - EMAIL_PORT: {settings.EMAIL_PORT}")
        print(f"  - EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
        
        subject = f"[CareerPlatform] {user.username}님을 위한 채용 공고 알림 - {len(crawl_results)}개"
        html_message = generate_email_html(user, crawl_results)
        
        logger.info(f"  - 제목: {subject}")
        logger.info(f"  - HTML 메시지 생성 완료 ({len(html_message)} bytes)")
        print(f"  - 제목: {subject}")
        print(f"  - HTML 메시지 생성 완료 ({len(html_message)} bytes)")
        
        result = send_mail(
            subject=subject,
            message=f"채용 공고 알림입니다. 웹사이트에서 자세히 확인해주세요. (공고 {len(crawl_results)}개)",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"✅ [{user.email}] 이메일 발송 완료 (send_mail 반환값: {result})\n")
        print(f"✅ [{user.email}] 이메일 발송 완료 (send_mail 반환값: {result})\n")
    
    except Exception as e:
        logger.error(f"\n⚠️ [{user.email}] 이메일 발송 실패: {e}")
        logger.error(f"  - 오류 타입: {type(e).__name__}")
        logger.error(traceback.format_exc())
        
        print(f"\n⚠️ [{user.email}] 이메일 발송 실패: {e}")
        print(f"  - 오류 타입: {type(e).__name__}")
        print(traceback.format_exc())
