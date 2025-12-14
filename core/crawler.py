import requests, json, os, time, re
from bs4 import BeautifulSoup
from django.contrib.auth import get_user_model
from urllib.parse import quote
from datetime import datetime, timedelta
import glob

User = get_user_model()

# ===============================================================
# 파일 자동 정리
# ===============================================================
def cleanup_old_crawl_files(days_to_keep=3):
    """
    crawl_results/ 디렉토리의 7일 이상 된 JSON 파일 자동 삭제
    
    Args:
        days_to_keep: 유지할 파일의 최소 일 수 (기본값: 7일)
    """
    base_dir = os.path.join(os.path.dirname(__file__), '..', 'crawl_results')
    
    if not os.path.exists(base_dir):
        return
    
    cutoff_time = datetime.now() - timedelta(days=days_to_keep)
    deleted_files = []
    
    try:
        json_files = glob.glob(os.path.join(base_dir, '*.json'))
        
        for filepath in json_files:
            # 파일 수정 시간 확인
            file_mtime = datetime.fromtimestamp(os.path.getmtime(filepath))
            
            # 7일 이상 된 파일 삭제
            if file_mtime < cutoff_time:
                try:
                    os.remove(filepath)
                    deleted_files.append(os.path.basename(filepath))
                    print(f"🗑️ [정리] 삭제됨: {os.path.basename(filepath)}")
                except Exception as e:
                    print(f"⚠️ [정리] 삭제 실패 {os.path.basename(filepath)}: {e}")
        
        if deleted_files:
            print(f"✅ [정리 완료] {len(deleted_files)}개 파일 삭제됨")
        else:
            print(f"✅ [정리] 삭제할 파일 없음 (7일 이상 된 파일 없음)")
            
    except Exception as e:
        print(f"⚠️ [정리] 예외 발생: {e}")

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
    debug_count = 0

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
        
        # DEBUG: 첫 3개 항목의 span 구조를 확인
        if debug_count < 3:
            print(f"  [디버그] {debug_count}번 항목 - span 개수: {len(condition_tags)}")
            for idx, tag in enumerate(condition_tags):
                print(f"    [{idx}]: {tag.text.strip()[:50]}")
            debug_count += 1
        
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

        # experience가 비어있으면 다른 condition_tags에서 찾기
        if not experience:
            for i, tag in enumerate(condition_tags):
                tag_text = tag.text.strip()
                if '년' in tag_text and '졸' not in tag_text:
                    experience = tag_text
                    break
        
        # 그래도 없으면 기본값 설정
        if not experience:
            experience = "무관"

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
            print(f"📊 GroupBy 응답 데이터: {data}")
        except Exception as e:
            print("⚠️ GroupBy 예외:", e)
            import traceback
            print(traceback.format_exc())
            break

        container = data.get("data")
        print(f"📊 container 타입: {type(container)}, 값: {container}")
        
        if not isinstance(container, dict):
            print(f"⚠️ container가 dict가 아님: {type(container)}")
            break

        jobs = container.get("items")
        print(f"📊 jobs 타입: {type(jobs)}, 길이: {len(jobs) if isinstance(jobs, list) else 'N/A'}")
        
        if not isinstance(jobs, list) or not jobs:
            print(f"⚠️ jobs가 list가 아니거나 비어있음")
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
            
            # GroupBy 날짜를 Saramin 형식으로 변환 (~MM.DD(요일))
            if deadline:
                try:
                    from datetime import datetime
                    # ISO format 파싱
                    dt = datetime.fromisoformat(deadline.replace('Z', '+00:00'))
                    # "~12.09(수)" 형식으로 변환
                    day_names = ['월', '화', '수', '목', '금', '토', '일']
                    day_name = day_names[dt.weekday()]
                    deadline = dt.strftime(f"~%m.%d({day_name})")
                except:
                    deadline = ""
            
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
def _filter_by_career(results, career):
    """
    경력 필터링: experience 필드에서 최소 경력을 확인하여 필터링
    career 포맷: "1년~3년", "3년~5년", "5년 이상" 등
    """
    if not career:
        return results
    
    # career 문자열에서 최소/최대 경력 추출
    career_min = 0
    career_max = 100  # 기본값: 상한 없음
    try:
        if "이상" in career:
            # "5년 이상" → 5 ~ 100
            career_min = int(career.replace("년", "").replace(" 이상", "").strip())
            career_max = 100
        elif "~" in career:
            # "1년~3년" → 1 ~ 3
            parts = career.split("~")
            career_min = int(parts[0].replace("년", "").strip())
            career_max = int(parts[1].replace("년", "").strip())
    except:
        return results
    
    filtered = []
    for job in results:
        experience = job.get("experience", "")
        
        # experience가 비어있으면 제외 (경력 정보가 없음)
        if not experience:
            continue
        
        # "무관"인 경우 항상 포함 (모든 경력 수준에 적합)
        if "무관" in experience:
            filtered.append(job)
            continue
        
        try:
            # experience에서 최소 경력 추출
            exp_min = 0
            exp_max = 100  # 기본값: 상한 없음
            
            # "경력 5" 형식 처리
            if "경력" in experience:
                exp_clean = experience.replace("경력", "").strip()
                # "5~10년" 형식에서 첫 번째 숫자만 추출
                if "~" in exp_clean:
                    parts = exp_clean.split("~")
                    exp_min = int(parts[0].replace("년", "").strip())
                    exp_max = int(parts[1].replace("년", "").strip())
                else:
                    # "5년" 형식에서 숫자 추출
                    exp_min = int(exp_clean.replace("년", "").strip())
                    exp_max = exp_min
            elif "이상" in experience:
                # "5년 이상" → 5 ~ 100
                exp_min = int(experience.replace("년", "").replace(" 이상", "").strip())
                exp_max = 100
            elif "~" in experience:
                # "1년~3년" → 1 ~ 3
                parts = experience.split("~")
                exp_min = int(parts[0].replace("년", "").strip())
                exp_max = int(parts[1].replace("년", "").strip())
            else:
                # 단일 숫자 "3년" → 3
                exp_min = int(experience.replace("년", "").strip())
                exp_max = exp_min
            
            # 공고의 최소 경력이 사용자 범위 내에 있는 경우만 포함
            # exp_min >= career_min이고 exp_min <= career_max여야 함
            # (공고가 요구하는 최소경력이 사용자가 가진 범위 내에 있어야 함)
            if career_min <= exp_min <= career_max:
                filtered.append(job)
        except ValueError:
            # 파싱 실패 시 해당 공고는 제외
            continue
    
    print(f"[경력 필터링] {career} -> {len(results)}건 중 {len(filtered)}건 선택")
    return filtered


def _filter_by_region(results, regions):
    """
    지역 필터링: location 필드에만 지역이 포함되어 있는지 확인
    - regions: 단일 문자열 또는 리스트 (예: "서울" 또는 ["서울", "경기"])
    """
    # 문자열을 리스트로 변환
    if isinstance(regions, str):
        if not regions:
            return results
        regions = [regions]
    elif not regions:
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
    
    # 모든 지역의 키워드를 조합
    all_keywords = []
    for region in regions:
        keywords = region_keywords.get(region, [region])
        all_keywords.extend(keywords)
    
    filtered = []
    excluded_saramin = []  # DEBUG
    
    # 무시할 키워드 (location에 이런 단어가 있으면 지역이 아님)
    exclude_keywords = ["입사지원", "채용", "공고", "지원", "문의", "연락", "신청", "보기", "자세히"]
    
    for job in results:
        location = job.get("location", "").strip()
        is_saramin = "saramin" in job.get("source", "").lower()
        
        # location이 비어있으면 제외
        if not location:
            if is_saramin:
                excluded_saramin.append(f"[location이 비어있음] {job.get('title', '')[:50]}")
            continue
        
        # 제외 키워드가 포함되어 있으면 제외
        excluded_kw = None
        for exc in exclude_keywords:
            if exc in location:
                excluded_kw = exc
                break
        
        if excluded_kw:
            if is_saramin:
                excluded_saramin.append(f"[제외키워드: {excluded_kw}] {location}")
            continue
        
        # 요청된 지역 중 하나라도 포함되면 통과 (OR 로직)
        if any(kw in location for kw in all_keywords):
            filtered.append(job)
        else:
            if is_saramin:
                excluded_saramin.append(f"[지역미매칭] {location} (찾는 지역: {all_keywords})")
    
    regions_str = ", ".join(regions) if isinstance(regions, list) else regions
    print(f"🔍 [지역 필터링] {regions_str} → {len(results)}건 중 {len(filtered)}건 선택")
    if excluded_saramin:
        print(f"  ⚠️ 제외된 Saramin:")
        for msg in excluded_saramin[:10]:
            print(f"    {msg}")
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
    # 세부 직무가 있으면 duty와 함께 포함 (더 나은 검색 결과)
    keywords = []
    
    # duty와 subDuties 모두 포함하되, 빈 문자열 제거
    if duty:
        keywords.append(duty)
    
    if subDuties:
        keywords.extend([s for s in subDuties if s])
    
    if region and region != '서울':
        keywords.append(region)
    if career:
        keywords.append(career)
    
    search_keyword = " ".join(filter(None, keywords))
    
    # 만약 검색어가 비어있으면 duty만 사용
    if not search_keyword and duty:
        search_keyword = duty
    
    results = []
    
    # Saramin 크롤링 (에러 처리)
    try:
        saramin_results = crawl_saramin(search_keyword)
        print(f"📊 [Saramin 원본] {len(saramin_results)}건")
        for i, job in enumerate(saramin_results[:5]):  # 처음 5개만 출력
            print(f"  {i+1}. {job['title'][:30]} | {job.get('location', 'N/A')} | {job.get('experience', 'N/A')}")
        results.extend(saramin_results)
        print(f"✅ Saramin 크롤링 성공: {len(saramin_results)}건")
    except Exception as e:
        import traceback
        print(f"⚠️ Saramin 크롤링 오류: {e}")
        print(f"⚠️ 상세: {traceback.format_exc()}")
    
    # GroupBy 크롤링 (에러 처리)
    try:
        groupby_results = crawl_groupby(search_keyword)
        results.extend(groupby_results)
        print(f"✅ GroupBy 크롤링 성공: {len(groupby_results)}건")
    except Exception as e:
        print(f"⚠️ GroupBy 크롤링 오류: {e}")

    # 중복 제거 (링크 기준)
    results = list({r["link"]: r for r in results}.values())
    print(f"✅ [중복 제거 후] {len(results)}건")
    
    # 경력 필터링 (요청한 경력 범위에만 포함)
    if career:
        results = _filter_by_career(results, career)
    
    # 지역 필터링 (요청한 지역만 포함)
    # 디버그: Saramin 결과를 확인하기 위해 일단 필터링 앞의 결과를 출력
    print(f"🔎 [지역 필터링 전] 총 {len(results)}건")
    for job in results[:5]:  # 처음 5개만 출력
        print(f"  - {job['source']}: {job.get('location', 'N/A')} | {job['title'][:30]}")
    
    if region:
        results = _filter_by_region(results, region)
    
    # 결과 정렬 (최신 공고 우선 - deadline 기준)
    results.sort(key=lambda x: x.get("deadline") or "", reverse=True)

    print(f"✅ [필터 크롤링] 완료 → 총 {len(results)}건")
    return results


# ===============================================================
# 이메일 생성 함수
# ===============================================================
def generate_email_html(user, crawl_results):
    """
    크롤링 결과를 HTML 이메일 형식으로 변환
    
    Args:
        user: User 객체
        crawl_results: 크롤링 결과 리스트
    
    Returns:
        HTML 문자열
    """
    if not crawl_results:
        return f"""
        <html>
            <body style="font-family: Arial, sans-serif; color: #333;">
                <h2>🎯 {user.username}님의 채용 공고 검색 결과</h2>
                <p>검색어: {user.spec_job}</p>
                <p style="color: #999;">📭 현재 매칭되는 채용 공고가 없습니다.</p>
            </body>
        </html>
        """
    
    job_html = ""
    for idx, job in enumerate(crawl_results[:20], 1):  # 상위 20개만 표시
        job_html += f"""
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #ddd;">
                <strong>{idx}. {job.get('title', 'N/A')[:50]}</strong><br>
                <small style="color: #666;">
                    🏢 {job.get('company', 'N/A')} | 📍 {job.get('location', 'N/A')} | ⏰ {job.get('deadline', 'N/A')}<br>
                    출처: {job.get('source', 'Unknown')}
                </small>
                <br><a href="{job.get('link', '#')}" style="color: #0066cc; text-decoration: none;">👉 자세히 보기</a>
            </td>
        </tr>
        """
    
    html_content = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #0066cc;">🎯 {user.username}님의 채용 공고 검색 결과</h2>
                <p style="color: #666;">검색어: <strong>{user.spec_job}</strong> | 총 <strong>{len(crawl_results)}</strong>개 공고</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                
                <table style="width: 100%; border-collapse: collapse;">
                    {job_html}
                </table>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">
                    이 이메일은 자동으로 발송되었습니다. 매주 월요일 오전 9시에 발송됩니다.<br>
                    웹사이트에서 검색 설정을 변경할 수 있습니다.
                </p>
            </div>
        </body>
    </html>
    """
    
    return html_content


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
