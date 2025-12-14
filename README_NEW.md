# YourConnect 커리어 플랫폼

유어커넥트 AI 채용 공고 추천 및 헤드헌팅 플랫폼

---

## 🚀 빠른 시작 (자동)

### Windows에서 한 번에 실행
프로젝트 폴더에서 **`start_all.bat`** 더블클릭!

**자동으로 실행되는 것:**
- ✅ Redis 서버 (포트 6379)
- ✅ Celery 워커 (비동기 작업 처리)
- ✅ Django 개발 서버 (포트 8000)

30초 정도 기다린 후 → **http://127.0.0.1:8000** 접속 🎉

---

## 📋 수동 구동 방법 (VSCode에서 단계별)

### 사전 준비
- **Python 3.x** 설치 완료
- **Redis** 설치 완료 (Windows용 WSL 또는 Redis 바이너리)
- **Node.js** (선택사항)

### ▶️ 1단계: Redis 서버 실행

**VSCode 터미널 1 열기:**
```powershell
redis-server
```

✅ **성공 시:**
```
Ready to accept connections tcp
```

---

### ▶️ 2단계: Python 가상환경 + Celery 워커 실행

**VSCode 터미널 2 열기:**
```powershell
# 가상환경 활성화
.\venv\Scripts\activate

# Celery 워커 실행
celery -A career_platform worker -l info --pool=solo
```

✅ **성공 시:**
```
celery@DESKTOP ready.
```

---

### ▶️ 3단계: Django 개발 서버 실행

**VSCode 터미널 3 열기:**
```powershell
# 가상환경이 이미 활성화된 상태 (터미널 2와 동일)
python manage.py runserver
```

✅ **성공 시:**
```
Starting development server at http://127.0.0.1:8000/
```

---

### ▶️ 4단계: 웹사이트 접속

브라우저 주소창에 입력:
```
http://127.0.0.1:8000
```

🎉 **완료!** 헤드헌팅 페이지가 뜨면 성공

---

## 📁 프로젝트 구조

```
career_platform/
│
├── manage.py                    # Django 프로젝트 진입점
├── db.sqlite3                   # SQLite 데이터베이스 (개발용)
├── dump.rdb                     # Redis 영속성 파일
│
├── career_platform/             # Django 프로젝트 설정
│   ├── settings.py             # 프로젝트 전역 설정
│   ├── urls.py                 # 메인 URL 라우팅
│   ├── wsgi.py / asgi.py       # 웹 서버 인터페이스
│   └── celery.py               # Celery 설정
│
├── core/                        # 핵심 앱 (크롤링, API, 필터링)
│   ├── models.py               # 데이터베이스 모델 정의
│   ├── views.py                # REST API 엔드포인트
│   ├── crawler.py              # Saramin/GroupBy 크롤러
│   ├── tasks.py                # Celery 비동기 작업
│   ├── spec_api.py             # 직무 스펙 분석 API
│   ├── urls.py                 # API URL 라우팅
│   ├── admin.py                # Django 관리자 설정
│   └── migrations/             # DB 스키마 변경 이력
│       └── 0001_initial.py     # 초기 마이그레이션
│
├── src/                         # React 프론트엔드
│   ├── Headhunting.jsx         # 🔥 헤드헌팅 메인 페이지
│   │   ├── 필터링 (직무, 경력, 지역)
│   │   ├── 공고 검색 & 크롤링
│   │   ├── ⭐ 즐겨찾기
│   │   ├── 📌 스크랩한 공고
│   │   └── 👁️ 최근 본 공고
│   ├── headhunting.css         # 헤드헌팅 스타일
│   ├── Profile.jsx             # 사용자 프로필
│   ├── Spec.jsx                # 직무 스펙 관리
│   ├── Home.jsx                # 홈 페이지
│   ├── LoginForm.jsx           # 로그인
│   ├── Signup.jsx              # 회원가입
│   ├── Header.js               # 상단 네비게이션
│   └── ...
│
├── public/                      # React 빌드 정적 파일
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
│
├── crawl_results/               # 크롤링 결과 저장소
│   ├── results_filter_개발_*.json
│   ├── results_filter_데이터_*.json
│   └── ...
│
├── _archived/                   # 테스트/디버그 파일 (보관용)
│   ├── test_api.py
│   ├── debug_filter.py
│   ├── check_db.py
│   └── ...
│
├── venv/                        # Python 가상환경
├── node_modules/                # Node.js 패키지 (React)
│
├── start_all.bat                # ⭐ 전체 서버 자동 실행 (권장)
├── push_all.bat                 # Git 자동 커밋/푸시
│
└── README.md                    # 이 문서
```

---

## 🔧 주요 API 엔드포인트

### 1️⃣ 채용공고 크롤링 & 필터링

**엔드포인트:**
```
POST http://127.0.0.1:8000/api/crawl-filters/
```

**요청 예시:**
```json
{
  "duties": ["개발"],
  "sub_duties": ["백엔드", "프론트엔드"],
  "careers": ["1년~3년"],
  "regions": ["서울", "경기"]
}
```

**응답:**
```json
{
  "total": 42,
  "results": [
    {
      "title": "[코베팀] 전시마케팅 채용",
      "company": "(주)메씨이상",
      "location": "서울 마포구",
      "deadline": "2025-12-25",
      "link": "https://www.saramin.co.kr/zf_user/jobs/...",
      "source": "Saramin"
    },
    ...
  ]
}
```

---

### 2️⃣ 크롤링 결과 조회

**엔드포인트:**
```
GET http://127.0.0.1:8000/api/crawl-results/
```

**응답:**
JSON 파일로 최근 크롤링 결과 반환

---

## 🔍 주요 기능 설명

### 1️⃣ 채용공고 크롤링 (Crawling)

**작동 방식:**
1. 사용자가 필터 입력 (직무, 경력, 지역)
2. Django 백엔드가 요청 받음
3. Celery가 비동기 작업으로 크롤링 시작
4. **Saramin**: BeautifulSoup로 HTML 파싱
5. **GroupBy**: REST API 호출
6. 결과를 JSON으로 저장 및 응답

**지원 채용 사이트:**
- 🟡 Saramin (사람인) - HTML 크롤링
- 🔵 GroupBy - API 연동

**검색 조건:**
- 직무 + 세부 직무
- 경력 범위
- 근무 지역 (멀티 리전)

---

### 2️⃣ 스마트 필터링 (Filtering)

**필터링 로직:**
```
경력 범위 검사:
- 무관 공고 → 항상 포함 ✓
- 1년~3년 공고 → "1년~3년", "무관" 검색 결과만 ✓
- 4년~6년 공고 → "4년~6년", "무관" 검색 결과만 ✓
```

**경력 옵션:**
```
["1년~3년", "4년~6년", "7년~9년", "10년 이상"]
```

---

### 3️⃣ 사용자 상호작용 (Frontend)

#### ⭐ 즐겨찾기 기능
```
별 ☆ 클릭
  ↓
⭐ 로 변경 (노란색)
  ↓
자동으로 "스크랩한 공고"에 추가
  ↓
별 ⭐ 다시 클릭
  ↓
☆ 로 변경 (회색)
  ↓
"스크랩한 공고"에서 자동 제거
```

#### 📌 스크랩한 공고 (Saved Jobs)
```
⭐ 즐겨찾기한 공고 목록
  ↓
박스 클릭 → 새 탭에서 공고 링크 열기
  ↓
X 버튼 클릭 → 삭제 & 별 꺼짐
  ↓
localStorage에 자동 저장
```

#### 👁️ 최근 본 공고 (Recently Viewed)
```
"지원 공고 확인" 버튼 클릭
  ↓
새 탭에서 Saramin 공고 페이지 열기
  ↓
자동으로 "최근 본 공고"에 추가 (최대 10개)
  ↓
X 버튼으로 제거 가능
  ↓
localStorage에 자동 저장
```

**데이터 영속성:**
- 🔄 localStorage를 사용해 브라우저에 저장
- 🔄 페이지 새로고침 후에도 데이터 유지
- 🔄 같은 브라우저에서만 동기화 (개인용)

---

### 4️⃣ 직무 스펙 관리 (User Profile)

사용자가 등록한 경력 정보:
- 경력 수년
- 기술 스택
- 희망 급여
- 원하는 지역

---

## 🛠️ 기술 스택

| 구성요소 | 기술 |
|---------|------|
| **백엔드** | Django 5.2.9, Django REST Framework |
| **프론트엔드** | React 18, JavaScript, JSX |
| **데이터베이스** | SQLite (개발), PostgreSQL (프로덕션 예정) |
| **작업 큐** | Celery 5.x + Redis |
| **웹 크롤링** | BeautifulSoup4, Requests |
| **API** | GroupBy 채용공고 API, Saramin 웹 스크래핑 |
| **배포** | Gunicorn, Nginx (프로덕션 예정) |

---

## 🐛 트러블슈팅

### ❌ "Redis에 연결할 수 없습니다"

**해결:**
```powershell
# Redis가 설치되었는지 확인
redis-server --version

# WSL에서 Redis 실행하는 경우
wsl redis-server

# 또는 별도 CMD/PowerShell 창에서:
redis-server
```

---

### ❌ "Celery 워커 에러" (Windows)

**해결:**
```powershell
# --pool=solo 옵션 필수 (Windows)
celery -A career_platform worker -l info --pool=solo
```

---

### ❌ "포트 8000이 이미 사용 중입니다"

**해결:**
```powershell
# 다른 포트로 변경
python manage.py runserver 8080
```

---

### ❌ "모듈을 찾을 수 없습니다"

**해결:**
```powershell
# 가상환경이 활성화되었는지 확인 (앞에 (venv) 표시)
.\venv\Scripts\activate

# 패키지 재설치
pip install -r requirements.txt
```

---

## 📝 데이터 저장 위치

| 데이터 | 저장소 |
|--------|--------|
| 크롤링 결과 | `crawl_results/` (JSON) |
| 사용자 데이터 | `db.sqlite3` (SQLite) |
| 브라우저 데이터 (favorites, saved, recent) | `localStorage` (클라이언트) |
| Redis 캐시 | `dump.rdb` (메모리) |

---

## 📦 배포 (Production)

### Gunicorn + Nginx + PostgreSQL 구성

```bash
# 1. Gunicorn 설치
pip install gunicorn

# 2. Gunicorn으로 실행
gunicorn career_platform.wsgi:application --bind 0.0.0.0:8000

# 3. Nginx 설정 (별도 파일)
# /etc/nginx/sites-available/yourconnect
upstream django {
    server 127.0.0.1:8000;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://django;
    }
}
```

---

## 📄 라이선스

MIT License

---

## 🎯 프로젝트 목표

- AI 기반 맞춤형 채용공고 추천
- 경력/직무별 정확한 필터링
- 사용자 경력 스펙 관리
- 헤드헌팅 매칭 플랫폼

---

**수정 일시:** 2025년 12월 12일
