# YourConnect

AI 기반 채용공고 추천 및 헤드헌팅 플랫폼

---

## VSCode에서 웹사이트 시작하기

### 터미널 1: Celery 워커 시작
```bash
cd C:\Users\user\YourConnectDB\career_platform
.\venv\Scripts\Activate.ps1
celery -A career_platform worker -l info --pool=solo
```

### 터미널 2: Django 웹 서버 시작
```bash
python manage.py runserver
```

### 웹사이트 접속
브라우저에서 열기:
```
http://127.0.0.1:8000
```

✅ **React 웹 화면이 나타납니다!**

---

## 서버 종료

### Celery 워커 종료
```bash
# Ctrl + C
```

### Django 서버 종료
```bash
# Ctrl + C
```

---

## 포트가 겹칠 때 (강제 종료)

### 8000 포트 사용 중인 프로세스 찾기
```bash
netstat -ano | findstr :8000
```

### PID로 강제 종료
```bash
# PID가 5432라면
taskkill /PID 5432 /F
```

### 모든 python.exe 강제 종료
```bash
taskkill /IM python.exe /F
```

---

## 포트 변경하기

### Django 포트 변경 (8000 → 8080)
```bash
python manage.py runserver 8080
```

접속: **http://127.0.0.1:8080**

---

## 주요 기능

- ⭐ 즐겨찾기
- 📌 스크랩한 공고
- 👁️ 최근 본 공고
- 🔍 채용공고 검색 (Saramin, GroupBy)
- 💼 직무별 필터링

---

## 기술 스택

- **Backend**: Django 5.2.9, Django REST Framework
- **Frontend**: React 18, JavaScript/JSX
- **Database**: SQLite
- **Task Queue**: Celery
- **Web Scraping**: BeautifulSoup4
