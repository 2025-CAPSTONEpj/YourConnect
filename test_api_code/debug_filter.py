#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_platform.settings')
django.setup()

from core.crawler import crawl_with_filters

print("=== 전체 필터링 파이프라인 테스트 ===\n")
results = crawl_with_filters(
    duty='개발',
    subDuties=['FE', 'BE'],
    position='',
    career='1년~3년',
    region='서울'
)

print(f"\n\n=== 최종 결과 ===")
print(f"총 {len(results)}건")
print(f"\nSaramin 수: {sum(1 for r in results if r.get('source') == 'Saramin')}")
print(f"GroupBy 수: {sum(1 for r in results if r.get('source') == 'GroupBy')}")

print(f"\n=== Saramin 목록 ===")
for r in results:
    if r.get('source') == 'Saramin':
        print(f"  - {r['title'][:40]} | {r.get('location')}")
