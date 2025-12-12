import requests
from bs4 import BeautifulSoup
import json
from urllib.parse import quote

# Saramin 직접 테스트
keywords = [
    "데이터 사이언티스트",
    "데이터 엔지니어",
    "머신러닝",
    "인공지능",
    "데이터",
]

for keyword in keywords:
    print(f"\n{'='*60}")
    print(f"🔍 검색: {keyword}")
    print(f"{'='*60}")
    
    # URL 인코딩
    encoded_kw = quote(keyword)
    url = f"https://www.saramin.co.kr/zf_user/search?searchword={encoded_kw}"
    print(f"URL: {url[:80]}...")
    
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        r = requests.get(url, headers=headers, timeout=10)
        
        if r.status_code != 200:
            print(f"❌ 상태 코드: {r.status_code}")
            continue
        
        soup = BeautifulSoup(r.text, "html.parser")
        
        # 공고 항목 찾기
        items = soup.select("div.item_recruit")
        print(f"✅ 찾은 공고 수: {len(items)}")
        
        if items:
            # 첫 3개 항목의 제목 출력
            for i, item in enumerate(items[:3]):
                title_tag = item.select_one("h2.job_tit a")
                if title_tag:
                    title = title_tag.text.strip()
                    print(f"  {i+1}. {title[:60]}")
    
    except Exception as e:
        print(f"❌ 오류: {e}")
