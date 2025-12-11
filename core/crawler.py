import requests, json, os, time, re
from bs4 import BeautifulSoup
from django.contrib.auth import get_user_model
from urllib.parse import quote

User = get_user_model()

# -----------------------
# 키워드 정책
# -----------------------
EXCLUDE_TITLE_KEYWORDS = [
    "바리스타","카페","베이커리","요리","파티쉐","주방","서빙","매장","안내","홀","식음료",
    "상담","콜센터","전화","리셉션",
]

# ===============================================================
# 모드별 키워드
# ===============================================================
def get_keyword_by_mode(user, mode):
    if mode == "spec":
        return user.spec_job or ""
    elif mode == "desired":
        return user.desired_job or ""
    elif mode == "both":
        return f"{user.spec_job or ''} {user.desired_job or ''}".strip()
    return ""

# ===============================================================
# Saramin
# ===============================================================
def crawl_saramin(keyword):
    print(f"🔍 [Saramin] 검색 시작 → {keyword}")

    url = f"https://www.saramin.co.kr/zf_user/search?searchword={keyword}"
    headers = {"User-Agent": "Mozilla/5.0"}

    try:
        r = requests.get(url, headers=headers, timeout=10)
        if r.status_code != 200:
            print("⚠️ 사람인 요청 실패")
            return []
    except Exception as e:
        print("⚠️ 사람인 예외:", e)
        return []

    soup = BeautifulSoup(r.text, "html.parser")
    results = []

    for item in soup.select("div.item_recruit"):
        title_tag = item.select_one("h2.job_tit a")
        if not title_tag:
            continue

        title = title_tag.text.strip()
        link = "https://www.saramin.co.kr" + title_tag.get("href", "")

        if any(x in title for x in EXCLUDE_TITLE_KEYWORDS):
            continue

        company_tag = item.select_one("div.area_corp strong.corp_name a")
        company = company_tag.text.strip() if company_tag else ""

        # Saramin 조건 정보 추출 - span 인덱싱 방식
        condition_tags = item.select("div.area_job span")
        location = ""
        experience = ""
        deadline = ""
        
        # span 구조 분석:
        # [0]: title (스킵)
        # [1]: ? (보통 비어있음)
        # [2]: deadline
        # [3]: 지원 방식/기타
        # [4]: 지역명
        # [5]: 경력
        # [6]: 학력
        # [7]: 고용형태
        # [8]: 수정일
        
        if len(condition_tags) > 4:
            # 지역: index 4
            loc_text = condition_tags[4].text.strip()
            if loc_text:
                location = loc_text
        
        if len(condition_tags) > 5:
            # 경력: index 5
            exp_text = condition_tags[5].text.strip()
            if exp_text and '졸' not in exp_text:  # 학력 제외
                experience = exp_text
        
        if len(condition_tags) > 2:
            # 마감일: index 2
            dead_text = condition_tags[2].text.strip()
            if dead_text:
                deadline = dead_text

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

# ===============================================================
# GroupBy API (Selenium 완전 제거)
# ===============================================================
def crawl_groupby(keyword):
    print(f"🔍 [GroupBy API] 검색 → {keyword}")

    base_url = "https://api.groupby.kr/startup-positions/search"
    encoded = quote(keyword)
    limit = 10
    offset = 0

    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
        "Referer": "https://groupby.kr/",
        "Origin": "https://groupby.kr"
    }

    results = []
    page = 1

    while True:
        url = f"{base_url}?limit={limit}&offset={offset}&searchQuery={encoded}"

        try:
            r = requests.get(url, headers=headers, timeout=10)
            if r.status_code != 200:
                print("⚠️ GroupBy API 실패:", r.status_code)
                break

            data = r.json()
        except Exception as e:
            print("⚠️ GroupBy 예외:", e)
            break

        container = data.get("data")
        if not isinstance(container, dict):
            break

        jobs = container.get("items")
        if not isinstance(jobs, list) or not jobs:
            break

        print("✅ 리스트 키 data['items']")

        for j in jobs:
            title = j.get("name") or ""
            startup = j.get("startup", {})

            company = startup.get("name", "")
            location = startup.get("location", "")
            address = startup.get("address", "")

            exp = j.get("experienceRange") or {}
            min_exp = exp.get("min")
            max_exp = exp.get("max")

            experience = ""
            if min_exp is not None and max_exp is not None:
                experience = f"{min_exp}~{max_exp}년"
            elif min_exp is not None:
                experience = f"{min_exp}년 이상"
            elif max_exp is not None:
                experience = f"{max_exp}년 이하"

            deadline = j.get("publishedAt")
            job_id = j.get("id")
            link = f"https://groupby.kr/positions/{job_id}"

            results.append({
                "title": title,
                "company": company,
                "experience": experience,
                "location": location or address,
                "deadline": deadline,
                "link": link,
                "source": "GroupBy"
            })

        offset += limit
        page += 1
        if page > 5:
            break

        time.sleep(1)

    print(f"👉 GroupBy {len(results)}건")
    return results

# ===============================================================
# 지역 필터링 함수
# ===============================================================
def _filter_by_region(results, region):
    """
    지역 필터링: location 필드에 지역이 포함되어 있는지 확인
    """
    if not region:
        return results
    
    # 지역 정보 매핑
    region_keywords = {
        "서울": ["서울"],
        "경기": ["경기"],
        "인천": ["인천"],
        "대전": ["대전"],
        "세종": ["세종"],
        "충남": ["충남"],
        "충북": ["충북"],
        "광주": ["광주"],
        "전남": ["전남"],
        "전북": ["전북"],
        "대구": ["대구"],
        "경북": ["경북"],
        "부산": ["부산"],
        "울산": ["울산"],
        "경남": ["경남"],
        "강원": ["강원"],
        "제주": ["제주"]
    }
    
    keywords = region_keywords.get(region, [region])
    filtered = []
    
    for job in results:
        location = job.get("location", "")
        experience = job.get("experience", "")
        
        # location이나 experience 필드에 지역명이 있으면 포함
        # (Saramin에서 location과 experience 필드 섞임 방지)
        if any(kw in location for kw in keywords) or any(kw in experience for kw in keywords):
            # 경험이 실제로 지역이 아닌지 확인 (예: "경기 시흥시"는 location이지만 experience 필드에 들어갈 수 있음)
            # experience 필드가 실제로 경력 관련 정보가 아니면 location 정보로 간주
            filtered.append(job)
        elif not experience or (not any(x in experience for x in ["년", "개월", "신입", "경력", "무관"])):
            # experience가 비어있거나 경력 정보가 아닌 경우, 지역 키워드가 location에만 있어도 포함
            if any(kw in location for kw in keywords):
                filtered.append(job)
    
    print(f"🔍 [지역 필터링] {region} → {len(results)}건 중 {len(filtered)}건 선택")
    return filtered


# ===============================================================
# 필터 조건 기반 크롤링 (헤드헌팅용)
# ===============================================================
def crawl_with_filters(duty="", subDuties=None, position="", career="", region=""):
    """
    필터 조건에 맞게 크롤링 수행
    duty: 대분류 직무 (개발, 데이터, 기획 등)
    subDuties: 세부 직무 리스트 (["FE", "BE"] 등)
    position: 직급 (현재 사용 안 함)
    career: 경력 (1년~3년, 3년~5년 등)
    region: 지역 (서울, 경기, 부산 등)
    """
    if subDuties is None:
        subDuties = []
    
    # 검색 키워드 조합 생성
    # 여러 개의 세부 직무가 있으면 모두 포함
    if subDuties:
        keywords = subDuties
    else:
        keywords = [duty]
    
    if region and region != '서울':
        keywords.append(region)
    if career:
        keywords.append(career)
    
    search_keyword = " ".join(filter(None, keywords))
    
    print(f"🔍 [필터 크롤링] 검색 키워드 → {search_keyword}")
    print(f"   직무: {duty} | 세부: {subDuties} | 경력: {career} | 지역: {region}")

    results = []
    
    # Saramin 크롤링 (에러 처리)
    try:
        saramin_results = crawl_saramin(search_keyword)
        results.extend(saramin_results)
        print(f"✅ Saramin 크롤링 성공: {len(saramin_results)}건")
    except Exception as e:
        print(f"⚠️ Saramin 크롤링 오류: {e}")
    
    # GroupBy 크롤링 (에러 처리)
    try:
        groupby_results = crawl_groupby(search_keyword)
        results.extend(groupby_results)
        print(f"✅ GroupBy 크롤링 성공: {len(groupby_results)}건")
    except Exception as e:
        print(f"⚠️ GroupBy 크롤링 오류: {e}")

    # 중복 제거 (링크 기준)
    results = list({r["link"]: r for r in results}.values())
    
    # 지역 필터링 (요청한 지역만 포함)
    if region:
        results = _filter_by_region(results, region)
    
    # 결과 정렬 (최신 공고 우선 - deadline 기준)
    results.sort(key=lambda x: x.get("deadline", ""), reverse=True)

    print(f"✅ [필터 크롤링] 완료 → 총 {len(results)}건")
    return results


# ===============================================================
# 실행 엔진
# ===============================================================
def run_weekly_crawl(mode="desired"):
    users = User.objects.all()
    base_dir = os.path.join(os.getcwd(), "crawl_results")
    os.makedirs(base_dir, exist_ok=True)

    for user in users:
        keyword = get_keyword_by_mode(user, mode)
        if not keyword:
            print(f"⚠️ {user.username} : 검색어 없음")
            continue

        print(f"\n=============== 🎯 {user.username} ({keyword}) ===============")
        print(f"🔥 크롤링 모드: {mode}")

        results = []
        results.extend(crawl_saramin(keyword))
        results.extend(crawl_groupby(keyword))

        results = list({r["link"]: r for r in results}.values())

        path = os.path.join(base_dir, f"results_{mode}_{user.username}.json")
        with open(path, "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        print(f"[💾] 저장 완료 → {path} | 총 {len(results)}건")
