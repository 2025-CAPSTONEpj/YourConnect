import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_platform.settings')
django.setup()

from core.crawler import crawl_with_filters

# 데이터 사이언티스트로 검색 테스트
print("[테스트] 데이터 사이언티스트 검색")
results = crawl_with_filters(
    duty="인공지능/머신러닝",
    subDuties=["데이터 사이언티스트"],
    career="1년~3년",
    region=""
)

print(f"\n📊 총 결과: {len(results)}건")
if results:
    print("\n📄 처음 5개 결과:")
    for i, job in enumerate(results[:5], 1):
        print(f"{i}. {job.get('title', 'N/A')[:50]} | {job.get('source', 'N/A')} | {job.get('location', 'N/A')}")
