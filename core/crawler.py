import requests
from bs4 import BeautifulSoup
from .models import UserSelection, Option
from django.contrib.auth.models import User
import json

def build_query_for_user(user):
    selections = UserSelection.objects.filter(user=user).select_related('option')
    if not selections:
        return None

    data = {s.option.category: s.option.value for s in selections}
    job = data.get('직무', '')
    exp = data.get('경력', '')
    loc = data.get('근무지역', '')
    corp = data.get('기업형태', '')
    return f"{job} {exp} {loc} {corp} 채용공고"

def crawl_jobs(keyword):
    url = f"https://www.saramin.co.kr/zf_user/search?searchword={keyword}"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, "html.parser")

    jobs = []
    for item in soup.select("h2.job_tit a"):
        title = item.text.strip()
        link = "https://www.saramin.co.kr" + item["href"]
        jobs.append({"title": title, "link": link})

    return jobs

def run_weekly_crawl():
    users = User.objects.all()
    for user in users:
        query = build_query_for_user(user)
        if not query:
            print(f"[⚠️] {user.username} 선택값 없음, 건너뜀")
            continue
        results = crawl_jobs(query)
        with open(f"results_{user.username}.json", "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"[💾] {user.username} 결과 저장 완료 ({len(results)}건)")
