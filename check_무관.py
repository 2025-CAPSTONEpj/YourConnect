import json

# 실제 수집된 JSON 파일 확인
result_file = 'crawl_results/results_filter_인공지능_머신러닝_데이터_사이언티스트_1년~3년_서울.json'

with open(result_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# 경력 필드 분석
career_dist = {}
for item in data:
    exp = item.get('experience', '정보없음')
    if exp not in career_dist:
        career_dist[exp] = []
    career_dist[exp].append(item.get('company', 'N/A'))

print(f"총 {len(data)}건 중 경력별 분포:")
for exp, companies in sorted(career_dist.items()):
    print(f"  - '{exp}': {len(companies)}건")
    if '무관' in exp.lower():
        print(f"    예시: {companies[:2]}")
