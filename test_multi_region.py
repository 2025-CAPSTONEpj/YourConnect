import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_platform.settings')
django.setup()

from core.crawler import crawl_with_filters, _filter_by_region

# 단일 지역 테스트 (API처럼 region=""로 호출)
print("=== 단일 지역(서울) 테스트 ===")
results = crawl_with_filters('개발', ['FE', 'BE'], '', '1년~3년', '')
print(f'전체 결과: {len(results)}건')

# API 방식으로 region 필터 적용
results_seoul = _filter_by_region(results, '서울')
print(f'서울 필터: {len(results_seoul)}건')

saramin_count = 0
for job in results_seoul:
    source = job.get('source', '').lower()
    if 'saramin' in source:
        saramin_count += 1
        location = job.get('location', '위치 없음')
        title = job.get('title', '')[:50]
        print(f'  ✅ Saramin: {location} | {title}')

print(f'\n📊 Saramin: {saramin_count}건')
print(f'📊 GroupBy: {len(results_seoul) - saramin_count}건')

# 다중 지역 테스트
print('\n\n=== 다중 지역(서울, 경기) 테스트 ===')
results_multi = _filter_by_region(results, ['서울', '경기'])
print(f'서울+경기 필터: {len(results_multi)}건')

saramin_count2 = sum(1 for job in results_multi if 'saramin' in job.get('source', '').lower())
print(f'Saramin: {saramin_count2}건 (이전과 같아야 정상)')

# 불일치 지역 테스트
print('\n\n=== 대구 테스트 (불일치 지역) ===')
results_daegu = _filter_by_region(results, '대구')
print(f'대구 필터: {len(results_daegu)}건')

saramin_count3 = sum(1 for job in results_daegu if 'saramin' in job.get('source', '').lower())
print(f'Saramin 수: {saramin_count3} (0이어야 정상)')
