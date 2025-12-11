from django.urls import path
from . import views

urlpatterns = [
    # 인증 관련
    path("auth/login/", views.login_api, name="login"),
    path("auth/signup/", views.signup_api, name="signup"),
    path("auth/logout/", views.logout_api, name="logout"),
    path("auth/user/", views.user_info_api, name="user_info"),
    
    # 크롤링 관련
    path("crawl/", views.run_crawling_api, name="run_crawling"),
    path("crawl-filters/", views.crawl_with_filters_api, name="crawl_with_filters"),
    path("crawl-results/", views.get_crawl_results, name="get_crawl_results"),
    path("crawl-status/", views.check_crawl_status, name="check_crawl_status"),
    path("jobs/<str:username>/", views.get_user_jobs, name="user_jobs"),
]
