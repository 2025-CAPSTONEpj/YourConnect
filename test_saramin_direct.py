import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_platform.settings')
django.setup()

from core.crawler import crawl_saramin

# Saramin을 직접 크롤링 (여러 조건)
print("[Saramin 직접 크롤링 - 개발 + 1-3년]")

results_dev = crawl_saramin("개발")
print(f"검색: '개발' → {len(results_dev)}건")

results_fe = crawl_saramin("프론트엔드")
print(f"검색: '프론트엔드' → {len(results_fe)}건")

results_be = crawl_saramin("백엔드")
print(f"검색: '백엔드' → {len(results_be)}건")

# 모든 결과 합치기
all_results = results_dev + results_fe + results_be

# 중복 제거
unique = {}
for job in all_results:
    unique[job['url']] = job

print(f"\n📊 총 Saramin 결과 (중복 제거): {len(unique)}")

# 지역별 분류
from collections import defaultdict
by_location = defaultdict(int)

for job in unique.values():
    location = job.get('location', '미지정')
    by_location[location] += 1

print(f"\n📍 지역별:")
for location, count in sorted(by_location.items(), key=lambda x: -x[1]):
    print(f"  {location}: {count}건")

print(f"\n📄 샘플 (최대 5개):")
for i, (url, job) in enumerate(list(unique.items())[:5], 1):
    print(f"{i}. {job['title'][:50]} | {job.get('location', 'N/A')}")

