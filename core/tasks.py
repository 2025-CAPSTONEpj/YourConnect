from celery import shared_task
from .crawler import run_weekly_crawl, cleanup_old_crawl_files

@shared_task
def weekly_crawl_task():
    """
    Celery가 주기적으로 실행할 비동기 작업.
    - 매주 월요일 오전 9시마다 자동 실행
    """
    print("[🕘] 주간 크롤링 시작")
    run_weekly_crawl()
    print("[✅] 주간 크롤링 완료")
    
    # 크롤링 완료 후 7일 이상 된 파일 자동 삭제
    print("[🧹] 오래된 파일 정리 시작")
    cleanup_old_crawl_files(days_to_keep=7)
    print("[✅] 오래된 파일 정리 완료")
