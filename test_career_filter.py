import requests

try:
    url = 'http://localhost:8000/api/crawl-results/'
    params = {
        'duty': '인공지능/머신러닝',
        'subDuties': '데이터 사이언티스트',
        'career': '1년~3년',
        'regions': '서울'
    }
    
    r = requests.get(url, params=params)
    print(f"상태: {r.status_code}")
    
    if r.status_code == 200:
        data = r.json()
        jobs = data.get('jobs', [])
        print(f"결과 수: {len(jobs)}")
        
        # 경력별 분류
        career_types = {}
        for job in jobs:
            exp = job.get('experience', '정보없음')
            if exp not in career_types:
                career_types[exp] = 0
            career_types[exp] += 1
        
        print(f"\n경력별 분포:")
        for career, count in sorted(career_types.items()):
            print(f"  - {career}: {count}건")
        
        print(f"\n처음 3건:")
        for i, job in enumerate(jobs[:3], 1):
            print(f"{i}. {job.get('company')} | {job.get('experience')}")
    else:
        print(f"오류: {r.text[:200]}")
        
except Exception as e:
    print(f"오류: {e}")
    import traceback
    traceback.print_exc()
