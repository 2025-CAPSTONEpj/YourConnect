import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'career_platform.settings')
django.setup()

from core.models import User, Experience

print('=== 모든 사용자 ===')
for u in User.objects.all():
    print(f'ID: {u.id}, Email: {u.email}, Username: {u.username}')

print('\n=== 모든 경력 데이터 ===')
for e in Experience.objects.all():
    print(f'ID: {e.id}, User: {e.user.email} (User ID: {e.user.id}), Company: {e.company}, Created: {e.created_at}')

print(f'\n총 사용자: {User.objects.count()}명')
print(f'총 경력 데이터: {Experience.objects.count()}개')
