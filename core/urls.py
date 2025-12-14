from django.urls import path
from . import views
from . import spec_api

urlpatterns = [
    # 인증 관련
    path("auth/login/", views.login_api, name="login"),
    path("auth/signup/", views.signup_api, name="signup"),
    path("auth/logout/", views.logout_api, name="logout"),
    path("auth/user/", views.user_info_api, name="user_info"),
    path("auth/profile/", views.profile_update_api, name="profile_update"),
    path("check-login/", views.check_login_status, name="check_login"),  # ⭐ 로그인 상태 확인
    
    # 크롤링 관련
    path("crawl/", views.run_crawling_api, name="run_crawling"),
    path("crawl-send-now/", views.send_crawl_now_api, name="send_crawl_now"),
    path("test-email/", views.test_email_api, name="test_email"),  # 테스트 엔드포인트
    path("crawl-filters/", views.crawl_with_filters_api, name="crawl_with_filters"),
    path("crawl-results/", views.get_crawl_results, name="get_crawl_results"),
    path("crawl-status/", views.check_crawl_status, name="check_crawl_status"),
    path("jobs/<str:username>/", views.get_user_jobs, name="user_jobs"),
    
    # 경력(스펙) 관련
    path("specs/", spec_api.get_specs_api, name="get_specs"),
    path("specs/save/", spec_api.save_spec_api, name="save_spec"),
    path("specs/<int:spec_id>/", spec_api.delete_spec_api, name="delete_spec"),
]
