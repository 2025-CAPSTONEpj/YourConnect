import os
import json
import subprocess
import threading

from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth import get_user_model, authenticate, login
from django.contrib.auth.models import User as DjangoUser

from .crawler import crawl_with_filters


# 파일명 규칙을 한 군데에서 관리하기 위한 헬퍼
def _build_filter_key(duty, subDuties, career, region):
    """
    duty/subDuties/career/region 조합을 파일명에 쓰기 위한 키로 변환.
    - 공백은 '_'로 치환
    - subDuties에서 중복과 빈값 제거
    - 의도치 않게 섞여 들어온 career 값을 subDuties에서 제거해 중복 저장을 방지
    """
    duty = (duty or "").strip()
    career = (career or "").strip()
    region = (region or "").strip()

    cleaned_sub_duties = []
    seen = set()
    for sub in subDuties or []:
        sub_clean = str(sub).strip()
        if not sub_clean:
            continue
        if career and sub_clean == career:
            # 잘못 들어온 경력 문자열이 세부직무에 중복 포함되는 사례 방지
            continue
        if sub_clean in seen:
            continue
        cleaned_sub_duties.append(sub_clean)
        seen.add(sub_clean)

    sub_duty_str = "_".join(cleaned_sub_duties) if cleaned_sub_duties else "all"
    parts = [duty, sub_duty_str, career, region]
    # 빈 문자열을 제외하고 이어붙인 뒤 공백을 '_'로 치환
    key = "_".join([p for p in parts if p != ""]).replace(" ", "_")
    return key, cleaned_sub_duties


def _legacy_filter_key(duty, subDuties, career, region):
    """과거 잘못 저장된 파일명을 찾기 위한 fallback 키."""
    sub_duty_str = "_".join(subDuties) if subDuties else "all"
    return f"{duty}_{sub_duty_str}_{career}_{region}".replace(" ", "_")

User = get_user_model()


# ✅ 로그인 API
@csrf_exempt
@require_http_methods(["POST"])
def login_api(request):
    """
    POST /api/auth/login/
    
    요청 데이터:
    {
        "username": "user1",
        "password": "password123"
    }
    """
    try:
        data = json.loads(request.body)
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        if not username or not password:
            return JsonResponse({"error": "사용자명과 비밀번호는 필수입니다."}, status=400)
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return JsonResponse({
                "message": "로그인 성공",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "first_name": user.first_name
                }
            })
        else:
            return JsonResponse({"error": "사용자명 또는 비밀번호가 올바르지 않습니다."}, status=401)
    
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ✅ 회원가입 API
@csrf_exempt
@require_http_methods(["POST"])
def signup_api(request):
    """
    POST /api/auth/signup/
    
    요청 데이터:
    {
        "username": "user1",
        "email": "user1@example.com",
        "password": "password123"
    }
    """
    try:
        data = json.loads(request.body)
        username = data.get('username', '').strip()
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        
        if not username or not email or not password:
            return JsonResponse({"error": "모든 필드는 필수입니다."}, status=400)
        
        if DjangoUser.objects.filter(username=username).exists():
            return JsonResponse({"error": "이미 존재하는 사용자명입니다."}, status=400)
        
        if DjangoUser.objects.filter(email=email).exists():
            return JsonResponse({"error": "이미 존재하는 이메일입니다."}, status=400)
        
        user = DjangoUser.objects.create_user(
            username=username,
            email=email,
            password=password
        )
        
        login(request, user)
        
        return JsonResponse({
            "message": "회원가입 성공",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email
            }
        })
    
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ✅ 로그아웃 API
@csrf_exempt
def logout_api(request):
    """
    POST /api/auth/logout/
    """
    try:
        from django.contrib.auth import logout
        logout(request)
        return JsonResponse({"message": "로그아웃 성공"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ✅ 사용자 정보 조회 API
@csrf_exempt
def user_info_api(request):
    """
    GET /api/auth/user/
    """
    if request.user.is_authenticated:
        return JsonResponse({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "first_name": request.user.first_name
        })
    else:
        return JsonResponse({"error": "인증되지 않은 사용자입니다."}, status=401)


User = get_user_model()


# ✅ 사용자 프로필 수정
@login_required
def profile_edit(request):
    user = request.user

    if request.method == 'POST':
        user.spec_job = request.POST.get('spec_job')
        user.desired_job = request.POST.get('desired_job')
        user.save()
        return redirect('profile')

    return render(request, 'profile_edit.html', {'user': user})


# ✅ 필터 조건 기반 크롤링 API (헤드헌팅용)
@csrf_exempt
@require_http_methods(["POST"])
def crawl_with_filters_api(request):
    """
    POST /api/crawl-filters/
    
    요청 데이터:
    {
        "duty": "개발",
        "subDuties": ["FE", "BE"],  # 배열로 여러 개 가능
        "position": "사원",
        "career": "1년~3년",
        "region": "서울"
    }
    """
    try:
        data = json.loads(request.body)
        
        duty = data.get('duty', '')
        subDuties = data.get('subDuties', [])  # 배열로 받음
        position = data.get('position', '')
        career = data.get('career', '')
        region = data.get('region', '')
        
        # 비동기로 크롤링 실행 (백그라운드)
        def run_crawl():
            try:
                filter_key, cleaned_sub_duties = _build_filter_key(
                    duty=duty,
                    subDuties=subDuties,
                    career=career,
                    region=region,
                )

                # 각 subDuty에 대해 크롤링 수행 또는 모두 함께 수행
                jobs = crawl_with_filters(
                    duty=duty,
                    subDuties=cleaned_sub_duties,  # 정제된 세부 직무 목록
                    position=position,
                    career=career,
                    region=region
                )
                
                # 결과 저장 (선택적)
                base_dir = os.path.join(os.getcwd(), "crawl_results")
                os.makedirs(base_dir, exist_ok=True)
                result_path = os.path.join(base_dir, f"results_filter_{filter_key}.json")
                
                print(f"🔍 DEBUG - duty: {duty}")
                print(f"🔍 DEBUG - subDuties(raw): {subDuties}")
                print(f"🔍 DEBUG - subDuties(cleaned): {cleaned_sub_duties}")
                print(f"🔍 DEBUG - career: {career}")
                print(f"🔍 DEBUG - region: {region}")
                print(f"✅ 크롤링 결과 저장: {result_path}")
                
                with open(result_path, 'w', encoding='utf-8') as f:
                    json.dump(jobs, f, ensure_ascii=False, indent=2)
            except Exception as e:
                print(f"❌ 크롤링 오류: {e}")
        
        # 백그라운드 스레드에서 실행
        thread = threading.Thread(target=run_crawl)
        thread.daemon = True
        thread.start()
        
        return JsonResponse({
            "message": "크롤링이 시작되었습니다",
            "filters": {
                "duty": duty,
                "subDuties": subDuties,
                "position": position,
                "career": career,
                "region": region
            }
        })
    
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ✅ 크롤링 실행 API (기존)
@csrf_exempt
def run_crawling_api(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    try:
        BASE_DIR = os.getcwd()
        manage_path = os.path.join(BASE_DIR, "manage.py")

        subprocess.Popen([
            "python",
            manage_path,
            "shell",
            "-c",
            "from core.crawler import run_weekly_crawl; run_weekly_crawl(mode='desired')"
        ])

        return JsonResponse({"message": "크롤링 시작됨 ✅"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# ✅ JSON 결과 반환
def get_user_jobs(request, username):
    base_dir = os.path.join(os.getcwd(), "crawl_results")
    file_path = os.path.join(base_dir, f"results_desired_{username}.json")

    if not os.path.exists(file_path):
        return JsonResponse({"error": "No data available"}, status=404)

    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    return JsonResponse(data, safe=False)


# ✅ 크롤링 결과 조회 API (헤드헌팅용)
@csrf_exempt
def get_crawl_results(request):
    """
    GET /api/crawl-results/?duty=개발&subDuties=FE,BE&career=1년~3년&region=서울
    
    저장된 크롤링 결과를 반환합니다.
    """
    try:
        duty = request.GET.get('duty', '')
        subDuties_str = request.GET.get('subDuties', '')
        career = request.GET.get('career', '')
        region = request.GET.get('region', '')
        
        # 문자열을 배열로 변환
        subDuties_raw = [s.strip() for s in subDuties_str.split(',')] if subDuties_str else []

        base_dir = os.path.join(os.getcwd(), "crawl_results")

        # 정식 키 + 레거시 키(경력 중복 포함 가능) 둘 다 확인
        filter_key, cleaned_sub_duties = _build_filter_key(duty, subDuties_raw, career, region)
        result_path = os.path.join(base_dir, f"results_filter_{filter_key}.json")

        legacy_key = _legacy_filter_key(duty, subDuties_raw, career, region)
        legacy_path = os.path.join(base_dir, f"results_filter_{legacy_key}.json")
        
        print(f"📂 결과 파일 경로(정규화): {result_path}")
        print(f"📂 결과 파일 경로(레거시): {legacy_path}")

        target_path = result_path if os.path.exists(result_path) else legacy_path

        if not os.path.exists(target_path):
            print(f"⚠️ 파일 없음: {target_path}")
            return JsonResponse({"jobs": [], "message": "조건에 맞는 결과가 없습니다", "count": 0})
        
        with open(target_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"✅ 결과 로드 성공: {len(data)}건 | 사용 파일: {target_path}")
        return JsonResponse({"jobs": data, "count": len(data), "message": "성공"})
    
    except Exception as e:
        print(f"❌ 오류: {e}")
        return JsonResponse({"error": str(e), "jobs": [], "count": 0}, status=500)


# ✅ 크롤링 상태 확인 API
@csrf_exempt
def check_crawl_status(request):
    """
    GET /api/crawl-status/?duty=개발&subDuties=FE,BE&region=서울
    
    크롤링이 완료되었는지 확인합니다.
    """
    try:
        duty = request.GET.get('duty', '')
        subDuties_str = request.GET.get('subDuties', '')
        career = request.GET.get('career', '')
        region = request.GET.get('region', '')
        
        # 문자열을 배열로 변환
        subDuties_raw = [s.strip() for s in subDuties_str.split(',')] if subDuties_str else []
        
        base_dir = os.path.join(os.getcwd(), "crawl_results")
        filter_key, _ = _build_filter_key(duty, subDuties_raw, career, region)
        result_path = os.path.join(base_dir, f"results_filter_{filter_key}.json")
        
        exists = os.path.exists(result_path)
        return JsonResponse({"completed": exists})
    
    except Exception as e:
        return JsonResponse({"error": str(e), "completed": False}, status=500)
