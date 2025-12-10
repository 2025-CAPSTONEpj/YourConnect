import requests
from bs4 import BeautifulSoup
from django.contrib.auth import get_user_model
import json, os, time
from urllib.parse import quote

# Selenium
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

User = get_user_model()

# ==============================================================
# 제외 키워드 (비 IT)
# ==============================================================
EXCLUDE_TITLE_KEYWORDS = [
    "바리스타","베이커리","요리","파티쉐","주방","서빙","매장","안내","홀","식음료",
    "상담","콜센터","전화","리셉션",
]

# ==============================================================
# 모드별 키워드
# ==============================================================
def get_keyword_by_mode(user, mode):
    if mode == "spec":
        return user.spec_job or ""
    elif mode == "desired":
        return user.desired_job or ""
    elif mode == "both":
        return f"{user.spec_job or ''} {user.desired_job or ''}".strip()
    return ""

# ==============================================================
# Saramin
# ==============================================================
def crawl_saramin(keyword):
    print(f"🔍 [Saramin] 검색 시작 → {keyword}")

    url = f"https://www.saramin.co.kr/zf_user/search?searchword={keyword}"
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code != 200:
            print(f"⚠️ 사람인 {r.status_code}")
            return []
    except Exception as e:
        print(f"⚠️ 사람인 예외 {e}")
        return []

    soup = BeautifulSoup(r.text, "html.parser")
    results = []

    for item in soup.select("div.item_recruit"):
        title_tag = item.select_one("h2.job_tit a")
        if not title_tag:
            continue

        title = title_tag.get_text(strip=True)
        link = "https://www.saramin.co.kr" + title_tag.get("href", "")

        # ❌ 제외 필터만 유지
        if any(x in title for x in EXCLUDE_TITLE_KEYWORDS):
            continue

        # 회사명
        company_tag = item.select_one("div.area_corp strong.corp_name a")
        company = company_tag.get_text(strip=True) if company_tag else ""

        # 마감일
        deadline_tag = item.select_one("div.area_job div.job_date span.date")
        deadline = deadline_tag.get_text(strip=True) if deadline_tag else ""

        # 지역 / 경력
        cond = item.select("div.area_job div.job_condition span")
        location = ""
        experience = ""

        if len(cond) > 0:
            los = cond[0].select("a")
            location = " ".join(a.get_text(strip=True) for a in los) if los else cond[0].get_text(strip=True)
        if len(cond) > 1:
            experience = cond[1].get_text(strip=True)

        results.append({
            "title": title,
            "company": company,
            "experience": experience,
            "location": location,
            "deadline": deadline,
            "link": link,
            "source": "Saramin"
        })

    print(f"👉 사람인 {len(results)}건")
    return results

# ==============================================================
# Selenium Driver
# ==============================================================
def create_driver():
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--window-size=1920,1080")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-blink-features=AutomationControlled")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=opts
    )
    driver.implicitly_wait(5)
    return driver

# ==============================================================
# GroupBy 상세 (Selenium 안정화)
# ==============================================================
def fetch_groupby_detail_selenium(driver, url):
    exp = loc = ddl = ""

    try:
        driver.get(url)
        WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
        soup = BeautifulSoup(driver.page_source, "html.parser")

        def extract(label):
            tag = soup.find(string=lambda s: s and label in s)
            if not tag:
                return ""
            parent = tag.find_parent()
            if not parent:
                return ""
            next_div = parent.find_next("div")
            return next_div.get_text(strip=True) if next_div else ""

        exp = extract("경력")
        loc = extract("근무")
        ddl = extract("마감")

    except Exception as e:
        print(f"⚠️ GroupBy 상세 실패: {e}")

    return exp, loc, ddl

# ==============================================================
# GroupBy (API + Selenium 상세)
# ==============================================================
def crawl_groupby(keyword):
    print(f"🔍 [GroupBy API + Selenium 상세] 검색 → {keyword}")

    base_api = "https://api.groupby.kr/startup-positions/search"
    encoded = quote(keyword)
    limit = 10
    offset = 0
    headers = {
        "User-Agent":"Mozilla/5.0",
        "Accept":"application/json",
        "Referer":"https://groupby.kr/",
        "Origin":"https://groupby.kr",
    }

    results = []
    driver = create_driver()
    page = 0

    while True:
        url = f"{base_api}?limit={limit}&offset={offset}&searchQuery={encoded}"

        try:
            r = requests.get(url, headers=headers, timeout=10)
            if r.status_code != 200:
                print(f"⚠️ GroupBy API {r.status_code}")
                break
            data = r.json()
        except Exception as e:
            print(f"⚠️ GroupBy API 예외: {e}")
            break

        container = data.get("data")
        if not isinstance(container, dict):
            break

        jobs = None
        for k in ["items","results","list","positions"]:
            if isinstance(container.get(k), list):
                jobs = container[k]; print(f"✅ 리스트 키 data['{k}']"); break

        if not jobs:
            break

        for j in jobs:
        # ✅ 실제 필드 매핑
            title = j.get("name") or ""
            company = (j.get("startup") or {}).get("name", "")
            job_id = j.get("id")

        # ✅ API 기준 데이터
            experience = j.get("careerType", "")
            loc1 = (j.get("startup") or {}).get("location", "")
            loc2 = j.get("address", "")
            location = loc1 if loc1 else loc2

        # ✅ publishedAt = 마감 대용
            deadline = (j.get("publishedAt") or "")[:10]

            if not job_id:
                    continue

            link = f"https://groupby.kr/positions/{job_id}"

         # ✅ 필터는 제외키워드만 유지
            if any(x in title for x in EXCLUDE_TITLE_KEYWORDS):
                    continue

            results.append({
                "title": title,
                "company": company,
                "experience": experience,
                "location": location,
                "deadline": deadline,
                "link": link,
                "source": "GroupBy"
            })


            # ❌ keyword 필터 제거, 제외 키워드만 사용
            if any(x in title for x in EXCLUDE_TITLE_KEYWORDS):
                continue

            link = f"https://groupby.kr/positions/{job_id}"

        # Selenium 상세
            experience, location, deadline = fetch_groupby_detail_selenium(driver, link)

            results.append({
                "title": title,
                "company": company,
                "experience": experience,
                "location": location,
                "deadline": deadline,
                "link": link,
                "source": "GroupBy"
            })

            time.sleep(1)

            offset += limit
            page += 1
            if page >= 5:
                break

            driver.quit()
            print(f"👉 GroupBy {len(results)}건")
            return results

# ==============================================================
# 실행
# ==============================================================
def run_weekly_crawl(mode="both"):
    users = User.objects.all()
    base_dir = os.path.join(os.getcwd(), "crawl_results")
    os.makedirs(base_dir, exist_ok=True)

    for user in users:
        keyword = get_keyword_by_mode(user, mode)
        if not keyword:
            print(f"⚠️ {user.username}: 검색어 없음")
            continue

        print(f"\n=============== 🎯 {user.username} ({keyword}) ===============")
        print(f"🔥 크롤링 모드: {mode}")

        results = []
        results.extend(crawl_saramin(keyword))
        results.extend(crawl_groupby(keyword))

        # ✅ 중복 제거
        results = list({r["link"]: r for r in results}.values())

        path = os.path.join(base_dir, f"results_{mode}_{user.username}.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        print(f"[💾] 저장 완료 → {path} (총 {len(results)}건)")
