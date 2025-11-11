import requests
from bs4 import BeautifulSoup
from django.contrib.auth import get_user_model
import json
import os

User = get_user_model()

def build_query_for_user(user):
    """사용자 스펙과 희망직무를 기반으로 검색어 생성"""
    if not user.spec_job and not user.desired_job:
        return None
    return f"{user.spec_job or ''} {user.desired_job or ''} 채용공고".strip()


def crawl_jobs(keyword):
    """사람인에서 해당 키워드로 채용공고 크롤링"""
    url = f"https://www.saramin.co.kr/zf_user/search?searchword={keyword}"
    response = requests.get(url)
    if response.status_code != 200:
        print(f"[⚠️] 요청 실패 ({response.status_code})")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    jobs = []

    for item in soup.select("h2.job_tit a"):
        title = item.text.strip()
        link = "https://www.saramin.co.kr" + item["href"]
        jobs.append({"title": title, "link": link})

    return jobs


def run_weekly_crawl():
    """전체 사용자에 대해 맞춤 크롤링 실행"""
    users = User.objects.all()
    base_dir = os.path.join(os.getcwd(), "crawl_results")
    os.makedirs(base_dir, exist_ok=True)

    for user in users:
        query = build_query_for_user(user)
        if not query:
            print(f"[⚠️] {user.username}: 선택값 없음, 건너뜀")
            continue

        results = crawl_jobs(query)
        save_path = os.path.join(base_dir, f"results_{user.username}.json")
        with open(save_path, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        print(f"[💾] {user.username}: {len(results)}건 저장 완료")
