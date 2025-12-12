import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_platform.settings')
django.setup()

from core.crawler import _filter_by_career

# 테스트 데이터
test_jobs = [
    {"experience": "1년~3년", "company": "A회사"},
    {"experience": "3년~5년", "company": "B회사"},
    {"experience": "무관", "company": "C회사"},
    {"experience": "5년 이상", "company": "D회사"},
    {"experience": "무관", "company": "E회사"},
]

# 1년~3년 경력 필터링
result = _filter_by_career(test_jobs, "1년~3년")

print(f"필터 입력: 1년~3년")
print(f"결과: {len(result)}건")
for job in result:
    print(f"  - {job['company']} ({job['experience']})")

print(f"\n예상: 1년~3년(A) + 무관(C, E) + 3년~5년(B) = 4건")
print(f"실제: {len(result)}건")
if len(result) == 4:
    print("✅ 필터링 로직 정상!")
else:
    print("❌ 필터링 로직 오류")
