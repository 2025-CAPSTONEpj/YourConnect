# YourConnectDB

유어커넥트 프로젝트입니도~

## 가상환경 + REDIS + CELERY + DJANGO VSCODE에서 실행하는 법

1. 터미널에서 redis 실행<Br>
redis-server<Br><br>
*창에 이렇게 뜨면 정상 ✅<Br>
Ready to accept connections tcp<Br>
2. 터미널 2: 가상환경 실행 + Celery 실행<Br>
*프로젝트 폴더 (C:\Users\user\YourConnectDB\career_platform)로 이동한 뒤:

.\venv\Scripts\activate
celery -A career_platform worker -l info --pool=solo


아래처럼 “ready” 나오면 성공:

celery@DESKTOP ready.
   
