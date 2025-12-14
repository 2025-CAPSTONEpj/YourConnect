import requests
from bs4 import BeautifulSoup

url = 'https://www.saramin.co.kr/zf_user/search?searchword=데이터 분석가'
headers = {'User-Agent': 'Mozilla/5.0'}

r = requests.get(url, headers=headers, timeout=10)
soup = BeautifulSoup(r.text, 'html.parser')

# 첫 번째 채용공고 찾기
item = soup.select_one('div.item_recruit')
if item:
    print('=== 첫 번째 공고 area_job 내부 구조 ===')
    area_job = item.select_one('div.area_job')
    if area_job:
        # p 태그들 찾기
        ps = area_job.select('p')
        print(f'p 태그 {len(ps)}개 발견:')
        for i, p in enumerate(ps):
            text = p.get_text(strip=True)
            print(f'[{i}] {text[:100]}')
        
        print('\n=== span 태그 분석 ===')
        spans = area_job.select('span')
        print(f'span 태그 {len(spans)}개 발견:')
        for i, span in enumerate(spans):
            text = span.get_text(strip=True)
            if text:
                print(f'[{i}] "{text[:80]}"')
