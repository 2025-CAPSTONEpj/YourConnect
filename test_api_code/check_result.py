import json

result_file = 'crawl_results/results_filter_인공지능_머신러닝_데이터_사이언티스트_1년~3년_서울.json'

with open(result_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

print(f"총 건수: {len(data)}")
print(f"\n첫 번째 항목 구조:")
if data:
    print(json.dumps(data[0], indent=2, ensure_ascii=False)[:500])
