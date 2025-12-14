import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_platform.settings')
sys.path.insert(0, '/mnt/c/Users/user/YourConnectDB/career_platform')
django.setup()

from core.crawler import _filter_by_career

print("=" * 60)
print("경력 필터링 로직 테스트")
print("=" * 60)

# 테스트 데이터
test_jobs = [
    {"experience": "1년~3년", "company": "A회사"},
    {"experience": "3년~5년", "company": "B회사"},
    {"experience": "무관", "company": "C회사(무관)"},
    {"experience": "5년 이상", "company": "D회사"},
    {"experience": "신입포함/무관", "company": "E회사(신입포함무관)"},
]

print("\n[테스트 1] 1년~3년 경력 필터링")
result = _filter_by_career(test_jobs, "1년~3년")
print(f"결과: {len(result)}건")
for job in result:
    print(f"  ✓ {job['company']} ({job['experience']})")

print("\n[테스트 2] 3년~5년 경력 필터링")
result = _filter_by_career(test_jobs, "3년~5년")
print(f"결과: {len(result)}건")
for job in result:
    print(f"  ✓ {job['company']} ({job['experience']})")

print("\n[테스트 3] 5년 이상 경력 필터링")
result = _filter_by_career(test_jobs, "5년 이상")
print(f"결과: {len(result)}건")
for job in result:
    print(f"  ✓ {job['company']} ({job['experience']})")

print("\n결론: 모든 경력 필터에서 무관 공고(C, E)가 포함되어야 함")
