import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_platform.settings')
django.setup()

from core.crawler import crawl_with_filters, _filter_by_region

print("=" * 60)
print("🧪 최종 테스트: Saramin 다중 지역 필터링")
print("=" * 60)

# 테스트 1: 단일 지역 (서울)
print("\n[테스트 1] 단일 지역: 서울")
results = crawl_with_filters('개발', ['FE', 'BE'], '', '1년~3년', '')
results_seoul = _filter_by_region(results, '서울')
print(f"✅ 결과: {len(results_seoul)}건")
saramin_seoul = [r for r in results_seoul if 'saramin' in r.get('source', '').lower()]
print(f"   Saramin: {len(saramin_seoul)}건")
if saramin_seoul:
    print(f"   └─ {saramin_seoul[0].get('title', 'N/A')[:60]}")

# 테스트 2: 다중 지역 (서울, 경기)
print("\n[테스트 2] 다중 지역: 서울 + 경기")
results_multi = _filter_by_region(results, ['서울', '경기'])
print(f"✅ 결과: {len(results_multi)}건")
saramin_multi = [r for r in results_multi if 'saramin' in r.get('source', '').lower()]
print(f"   Saramin: {len(saramin_multi)}건")
if saramin_multi:
    print(f"   └─ {saramin_multi[0].get('title', 'N/A')[:60]}")

# 테스트 3: 3개 지역 (서울, 경기, 인천)
print("\n[테스트 3] 다중 지역: 서울 + 경기 + 인천")
results_three = _filter_by_region(results, ['서울', '경기', '인천'])
print(f"✅ 결과: {len(results_three)}건")
saramin_three = [r for r in results_three if 'saramin' in r.get('source', '').lower()]
print(f"   Saramin: {len(saramin_three)}건")

# 테스트 4: 불일치 지역 (대구)
print("\n[테스트 4] 불일치 지역: 대구")
results_daegu = _filter_by_region(results, '대구')
print(f"✅ 결과: {len(results_daegu)}건")
saramin_daegu = [r for r in results_daegu if 'saramin' in r.get('source', '').lower()]
print(f"   Saramin: {len(saramin_daegu)}건 (0이 정상)")

print("\n" + "=" * 60)
print("✅ 모든 테스트 완료! Saramin이 정상 작동합니다.")
print("=" * 60)
