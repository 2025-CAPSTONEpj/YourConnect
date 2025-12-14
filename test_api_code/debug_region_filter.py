import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_platform.settings')
django.setup()

from core.crawler import crawl_with_filters, _filter_by_region
import json

print("=" * 80)
print("🔍 지역 필터링 디버그")
print("=" * 80)

# 1단계: 지역 필터링 없이 크롤링
print("\n[1단계] 지역 필터 없이 크롤링 (region='')")
results = crawl_with_filters('개발', ['FE', 'BE'], '', '1년~3년', '')
print(f"📊 결과: {len(results)}건")

# Saramin 찾기
saramin_before = [job for job in results if 'saramin' in job.get('source', '').lower()]
print(f"  - Saramin 총: {len(saramin_before)}건")
for i, job in enumerate(saramin_before[:5]):
    print(f"    {i+1}. {job['title'][:40]} | {job.get('location', 'N/A')}")

# 2단계: 서울로 필터링
print("\n[2단계] 서울로 필터링")
results_seoul = _filter_by_region(results, '서울')
print(f"📊 서울 필터 후: {len(results_seoul)}건")

saramin_after = [job for job in results_seoul if 'saramin' in job.get('source', '').lower()]
print(f"  - Saramin: {len(saramin_after)}건")
for i, job in enumerate(saramin_after[:5]):
    print(f"    {i+1}. {job['title'][:40]} | {job.get('location', 'N/A')}")

# 3단계: 찾지 못한 Saramin 확인
print("\n[3단계] 필터링되어 제외된 Saramin 확인")
excluded = [job for job in saramin_before if job not in results_seoul]
print(f"📊 제외된 Saramin: {len(excluded)}건")
for i, job in enumerate(excluded[:10]):
    location = job.get('location', 'N/A')
    title = job['title'][:40]
    print(f"    {i+1}. {title} | {location}")
    # 왜 제외되었는지 확인
    if not location:
        print(f"       → location이 비어있음")
    elif "서울" in location:
        print(f"       → '서울'이 포함되어 있는데도 제외됨!")
    else:
        print(f"       → '서울'이 없음 (정상)")

print("\n" + "=" * 80)
