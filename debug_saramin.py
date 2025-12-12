#!/usr/bin/env python
# -*- coding: utf-8 -*-
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_platform.settings')
django.setup()

from core.crawler import crawl_saramin

results = crawl_saramin('개발 FE BE')
print('\n=== 첫 5개 항목의 location 값 ===')
for i, r in enumerate(results[:5]):
    print(f'{i}: {r["title"][:30]} → location={repr(r.get("location"))} source={r.get("source")}')
