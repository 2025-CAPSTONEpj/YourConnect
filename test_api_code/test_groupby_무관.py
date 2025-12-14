import requests

# GroupBy API에서 직접 검색
url = 'https://api.groupby.kr/api/jobs/search'
params = {
    'keyword': '데이터 사이언티스트',
    'careerType': '무관'  # 무관 옵션
}

try:
    r = requests.get(url, params=params, timeout=10)
    data = r.json()
    
    if data.get('status') == 200:
        jobs = data.get('data', {}).get('items', [])
        print(f"GroupBy에서 '무관' 경력 데이터: {len(jobs)}건")
        
        if jobs:
            print(f"\n처음 3건:")
            for i, job in enumerate(jobs[:3], 1):
                print(f"{i}. {job.get('name')} - {job.get('careerType')}")
    else:
        print(f"API 오류: {data.get('msg')}")
except Exception as e:
    print(f"오류: {e}")
