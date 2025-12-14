import os
import json
import subprocess
import threading
import logging

from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .crawler import cleanup_old_crawl_files
from django.contrib.auth import get_user_model, authenticate, login

from .models import User
from .crawler import crawl_with_filters, _filter_by_region, crawl_saramin, crawl_groupby, generate_email_html

# 로깅 설정
logger = logging.getLogger(__name__)
log_file = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'debug_email.log')
handler = logging.FileHandler(log_file, encoding='utf-8')
handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
logger.addHandler(handler)
logger.setLevel(logging.DEBUG)


# 파일명 규칙을 한 군데에서 관리하기 위한 헬퍼
def _build_filter_key(duty, subDuties, career, region):
    """
    duty/subDuties/career/region 조합을 파일명에 쓰기 위한 키로 변환.
    - 공백은 '_'로 치환
    - 슬래시와 특수문자는 언더스코어로 치환 (Windows 파일명 호환성)
    - subDuties에서 중복과 빈값 제거
    - 의도치 않게 섞여 들어온 career 값을 subDuties에서 제거해 중복 저장을 방지
    """
    def sanitize_filename(text):
        """Windows 파일명에 사용할 수 없는 문자를 언더스코어로 변환"""
        if not text:
            return ""
        # 불법 문자들: < > : " / \ | ? *
        import re
        text = re.sub(r'[<>:"/\\|?*]', '_', text)
        text = text.replace(" ", "_")
        return text
    
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
    # 빈 문자열을 제외하고 파일명 정규화 적용
    key = "_".join([sanitize_filename(p) for p in parts if p != ""])
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
        "email": "user1@example.com",
        "password": "password123"
    }
    """
    try:
        import base64
        data = json.loads(request.body)
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        
        if not email or not password:
            return JsonResponse({"error": "이메일과 비밀번호는 필수입니다."}, status=400)
        
        # 이메일로 사용자 찾기
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({"error": "이메일 또는 비밀번호가 올바르지 않습니다."}, status=401)
        
        # 비밀번호 확인
        if not user.check_password(password):
            return JsonResponse({"error": "이메일 또는 비밀번호가 올바르지 않습니다."}, status=401)
        
        # 로그인 처리 (세션 설정)
        login(request, user)
        
        # ⭐ 현재 로그인 사용자 명시적으로 확인
        logger.info(f"\n[✅ 로그인 성공]")
        logger.info(f"  - 사용자: {user.username}")
        logger.info(f"  - 이메일: {user.email}")
        logger.info(f"  - request.user: {request.user.username} ({request.user.email})")
        print(f"[✅ 로그인 성공] {user.username} ({user.email})")
        print(f"    request.user 확인: {request.user.username} ({request.user.email})")
        
        # 간단한 토큰 생성 (user id를 base64로 인코딩)
        token = base64.b64encode(f"{user.id}:{user.email}".encode()).decode()
        
        return JsonResponse({
            "message": "로그인 성공",
            "access": token,  # 프론트엔드에서 요청하는 필드
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "role": user.role
            }
        })
    
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        import traceback
        logger.error(f"❌ 로그인 오류: {e}")
        print(f"❌ 로그인 오류: {e}")
        print(traceback.format_exc())
        return JsonResponse({"error": str(e)}, status=500)


# ✅ 회원가입 API
@csrf_exempt
@require_http_methods(["POST"])
def signup_api(request):
    """
    POST /api/auth/signup/
    
    요청 데이터:
    {
        "email": "user1@example.com",
        "password": "password123",
        "name": "홍길동",
        "birth": "1990-01-01",
        "gender": "male",
        "role": "멘토",
        "account_type": "personal",
        "agree_age": true,
        "agree_service": true,
        "agree_personal_info": true,
        "agree_ad": false
    }
    """
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        name = data.get('name', '').strip()
        
        # 필수 필드 검증
        if not email or not password or not name:
            return JsonResponse({"error": "이메일, 비밀번호, 이름은 필수입니다."}, status=400)
        
        # 이미 존재하는 계정 검사
        if User.objects.filter(email=email).exists():
            return JsonResponse({"error": "이미 존재하는 이메일입니다."}, status=400)
        
        # username을 email로 사용 (unique 이어야 함)
        username = email.split('@')[0] + str(User.objects.count() + 1)
        
        # 사용자 생성
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=name,
            role=data.get('role', '멘티'),
            status='활성'
        )
        
        # 추가 필드 저장
        if data.get('birth'):
            user.bio = f"생년월일: {data.get('birth')}"
        if data.get('gender'):
            user.bio = (user.bio or '') + f" | 성별: {data.get('gender')}"
        user.save()
        
        login(request, user)
        
        return JsonResponse({
            "message": "회원가입 성공",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "name": user.first_name
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


# ✅ 사용자 프로필 업데이트 API
@csrf_exempt
def profile_update_api(request):
    """
    PUT /api/auth/profile/
    사용자 프로필 정보 업데이트 (생년월일, 성별, 역할, 마케팅 동의 등)
    """
    if request.method != 'PUT':
        return JsonResponse({"error": "PUT 메서드만 허용됩니다."}, status=405)
    
    if not request.user.is_authenticated:
        return JsonResponse({"error": "인증이 필요합니다."}, status=401)
    
    try:
        data = json.loads(request.body)
        user = request.user
        
        # 이름
        if 'name' in data:
            user.first_name = data['name']
        
        # 생년월일 (profile에 저장)
        if 'birth' in data:
            profile = user.userprofile
            profile.birth = data['birth']
            profile.save()
            print(f"📝 생년월일 저장: {data['birth']}")
        
        # 성별
        if 'gender' in data:
            profile = user.userprofile
            profile.gender = data['gender']
            profile.save()
            print(f"📝 성별 저장: {data['gender']}")
        
        # 역할 (역할 필드가 있다면)
        if 'role' in data:
            profile = user.userprofile
            if hasattr(profile, 'role'):
                profile.role = data['role']
                profile.save()
                print(f"📝 역할 저장: {data['role']}")
        
        # 마케팅 동의
        if 'agree_ad' in data:
            profile = user.userprofile
            profile.agree_ad = data['agree_ad']
            profile.save()
            print(f"📝 마케팅 동의 저장: {data['agree_ad']}")
        
        # 사용자 정보 저장
        user.save()
        
        print(f"✅ 프로필 업데이트 완료 - {user.username}")
        
        return JsonResponse({
            "message": "프로필이 업데이트되었습니다.",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "birth": getattr(user.userprofile, 'birth', ''),
                "gender": getattr(user.userprofile, 'gender', ''),
                "agree_ad": getattr(user.userprofile, 'agree_ad', False)
            }
        }, status=200)
    
    except Exception as e:
        print(f"❌ 프로필 업데이트 오류: {e}")
        return JsonResponse({"error": str(e)}, status=500)


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
        "regions": ["서울", "경기"]  # 배열로 여러 개 가능
    }
    """
    try:
        data = json.loads(request.body)
        
        duty = data.get('duty', '')
        subDuties = data.get('subDuties', [])  # 배열로 받음
        position = data.get('position', '')
        career = data.get('career', '')
        regions = data.get('regions', [])  # 배열로 받음
        
        # 비동기로 크롤링 실행 (백그라운드)
        def run_crawl():
            try:
                # 크롤링 전에 기존 파일 삭제 (같은 검색어라도 새로 크롤링하기 위해)
                sorted_regions_temp = sorted(set(regions)) if regions else []
                region_str_temp = "_".join(sorted_regions_temp) if sorted_regions_temp else ""
                filter_key_temp, _ = _build_filter_key(
                    duty=duty,
                    subDuties=subDuties,
                    career=career,
                    region=region_str_temp
                )
                base_dir = os.path.join(os.getcwd(), "crawl_results")
                old_file_path = os.path.join(base_dir, f"results_filter_{filter_key_temp}.json")
                if os.path.exists(old_file_path):
                    try:
                        os.remove(old_file_path)
                        print(f"🗑️ 기존 파일 삭제됨: {old_file_path}")
                    except Exception as e:
                        print(f"⚠️ 파일 삭제 실패: {e}")
                
                # 지역 필터 없이 모든 크롤링 결과 수집 (경력만 필터)
                all_results = []
                
                # 전체 데이터를 경력 필터만 적용하여 수집
                filter_key, cleaned_sub_duties = _build_filter_key(
                    duty=duty,
                    subDuties=subDuties,
                    career=career,
                    region="",  # 지역 필터링 없음
                )
                
                jobs = crawl_with_filters(
                    duty=duty,
                    subDuties=cleaned_sub_duties,
                    position=position,
                    career=career,
                    region=""  # 지역 필터링 없음
                )
                
                all_results.extend(jobs)
                print(f"✅ 크롤링 성공 (지역 필터 미적용): {len(all_results)}건")
                
                # 요청된 지역으로 필터링 (API 레벨)
                if regions:
                    all_results = _filter_by_region(all_results, regions)
                    print(f"✅ 지역 필터링 후: {len(all_results)}건 (지역: {', '.join(regions)})")
                
                # 중복 제거 (전체 결과에서)
                all_results = list({r["link"]: r for r in all_results}.values())
                
                # 저장할 파일명 생성 (요청된 지역들 포함, 정렬하여 일관성 유지)
                sorted_regions = sorted(set(regions)) if regions else []
                region_str = "_".join(sorted_regions) if sorted_regions else ""
                filter_key_final, _ = _build_filter_key(
                    duty=duty,
                    subDuties=subDuties,
                    career=career,
                    region=region_str
                )
                
                print(f"📊 크롤링된 데이터: {len(all_results)}건")
                print(f"📊 데이터 타입: {type(all_results)}")
                
                # 결과 저장
                base_dir = os.path.join(os.getcwd(), "crawl_results")
                os.makedirs(base_dir, exist_ok=True)
                result_path = os.path.join(base_dir, f"results_filter_{filter_key_final}.json")
                
                with open(result_path, 'w', encoding='utf-8') as f:
                    json.dump(all_results, f, ensure_ascii=False, indent=2)
                
                print(f"✅ 크롤링 결과 저장 완료: {result_path}")
                
                # 크롤링 완료 후 3일 이상 된 파일 자동 정리
                cleanup_old_crawl_files(days_to_keep=3)
            except Exception as e:
                import traceback
                print(f"❌ 크롤링 오류: {e}")
                print(f"❌ 상세 오류:")
                print(traceback.format_exc())
        
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
                "regions": regions
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


# ✅ 이메일 발송 테스트 API
@csrf_exempt
@require_http_methods(["POST", "GET"])
def test_email_api(request):
    """
    GET/POST /api/test-email/
    테스트 이메일 발송
    """
    print("\n[TEST] test_email_api 호출됨")
    
    if not request.user.is_authenticated:
        # 테스트용 - 첫 번째 사용자 사용
        user = get_user_model().objects.first()
        if not user:
            return JsonResponse({"error": "사용자 없음"}, status=400)
    else:
        user = request.user
    
    print(f"📧 테스트 이메일 발송: {user.email}")
    
    try:
        from .tasks import send_crawl_results_email
        
        # 테스트 데이터
        test_jobs = [
            {"title": "테스트 공고 1", "company": "테스트회사", "location": "서울", "deadline": "2025-12-31", "link": "https://example.com/1"},
            {"title": "테스트 공고 2", "company": "테스트회사2", "location": "경기", "deadline": "2025-12-25", "link": "https://example.com/2"},
        ]
        
        send_crawl_results_email(user, test_jobs)
        
        return JsonResponse({"message": "테스트 이메일 발송 완료", "email": user.email})
    
    except Exception as e:
        print(f"❌ 오류: {e}")
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)


# ✅ 즉시 크롤링 및 이메일 발송 API
@csrf_exempt
@require_http_methods(["POST"])
def send_crawl_now_api(request):
    """
    POST /api/crawl-send-now/
    
    요청 헤더:
    {
        "Authorization": "Bearer <token>" (선택사항)
    }
    
    요청 데이터:
    {
        "duty": "개발",
        "subDuties": ["FE", "BE"],
        "career": "1년~3년",
        "regions": ["서울", "경기"],
        "email": "user@example.com" (필수)
    }
    
    ✅ 요청된 이메일로 자동 발송됨!
    """
    logger.info(f"\n[🔍 API 요청] send_crawl_now_api 호출됨")
    
    try:
        # 요청 데이터 파싱
        data = json.loads(request.body) if request.body else {}
        user_email = data.get('email', '').strip()
        duty = data.get('duty', '')
        subDuties = data.get('subDuties', [])
        career = data.get('career', '')
        regions = data.get('regions', [])
        
        # ⭐ 이메일이 없으면 세션에서 조회 시도
        if not user_email:
            if request.user.is_authenticated:
                user_email = request.user.email
                user_username = request.user.username
            else:
                logger.warning(f"❌ 이메일 정보 없음 및 로그인되지 않은 사용자")
                return JsonResponse({"error": "이메일이 필요합니다."}, status=400)
        else:
            # 이메일로 사용자 조회
            try:
                user = User.objects.get(email=user_email)
                user_username = user.username
            except User.DoesNotExist:
                logger.warning(f"❌ 사용자 없음: {user_email}")
                return JsonResponse({"error": f"사용자를 찾을 수 없습니다: {user_email}"}, status=404)
        
        logger.info(f"✅ 요청 수신: {user_username} ({user_email})")
        logger.info(f"📝 검색 조건: duty={duty}, subDuties={subDuties}, career={career}, regions={regions}")
        print(f"✅ 요청 수신: {user_username} ({user_email})")
        print(f"📝 검색 조건: duty={duty}, subDuties={subDuties}, career={career}, regions={regions}")
        
        # 만약 조건이 제공되면 그것으로 검색, 없으면 보유스펙으로 검색
        if duty or subDuties or career or regions:
            search_keyword = duty
            print(f"\n[🔍] {user_username}님을 위한 조건 기반 크롤링 시작")
            print(f"  직무: {duty}, 세부: {subDuties}, 경력: {career}, 지역: {regions}")
        else:
            # 보유스펙으로 크롤링
            try:
                user_obj = User.objects.get(email=user_email)
                if not user_obj.spec_job:
                    return JsonResponse({
                        "error": "보유스펙이 저장되지 않았습니다.",
                        "message": "프로필에서 보유스펙을 먼저 선택하거나, 헤드헌팅 페이지에서 조건을 선택해주세요."
                    }, status=400)
                search_keyword = user_obj.spec_job
                print(f"\n[🔍] {user_username}님을 위한 보유스펙 기반 크롤링 시작 (검색어: {search_keyword})")
            except User.DoesNotExist:
                return JsonResponse({"error": "사용자를 찾을 수 없습니다."}, status=404)
        
        # 백그라운드에서 크롤링 실행
        def run_crawl_and_send():
            try:
                # Saramin + GroupBy에서 공고 수집
                results = []
                try:
                    saramin_results = crawl_saramin(search_keyword)
                    results.extend(saramin_results)
                    print(f"✅ Saramin 크롤링 완료: {len(saramin_results)}개")
                except Exception as e:
                    print(f"⚠️ Saramin 크롤링 오류: {e}")
                
                try:
                    groupby_results = crawl_groupby(search_keyword)
                    results.extend(groupby_results)
                    print(f"✅ GroupBy 크롤링 완료: {len(groupby_results)}개")
                except Exception as e:
                    print(f"⚠️ GroupBy 크롤링 오류: {e}")
                
                # 중복 제거
                results = list({r["link"]: r for r in results}.values())
                print(f"✅ 크롤링 완료 → {len(results)}개 공고 (중복 제거 후)")
                
                # 조건이 있으면 필터링
                if regions:
                    results = _filter_by_region(results, regions)
                    print(f"✅ 지역 필터링 후: {len(results)}개")
                
                if career:
                    results = crawl_with_filters(
                        duty=duty,
                        subDuties=subDuties,
                        position='',
                        career=career,
                        region=''
                    )
                    print(f"✅ 경력 필터링 후: {len(results)}개")
                
                # 이메일 발송
                if user_email:  # ⭐ user.email 대신 user_email 사용
                    # ⭐ Celery 대신 직접 발송
                    from django.core.mail import send_mail
                    from .crawler import generate_email_html
                    
                    logger.info(f"📧 [디버그] user_email 값: {user_email} (타입: {type(user_email).__name__})")
                    print(f"📧 [디버그] user_email 값: {user_email} (타입: {type(user_email).__name__})")
                    
                    logger.info(f"📧 이메일 발송 시작: {user_email}, 공고 {len(results)}개")
                    print(f"📧 이메일 발송 시작: {user_email}, 공고 {len(results)}개")
                    
                    try:
                        html_content = generate_email_html(user, results)
                        
                        # 발송 전 최종 확인
                        recipient_list = [user_email]
                        logger.info(f"📧 [최종 확인] recipient_list: {recipient_list}")
                        print(f"📧 [최종 확인] recipient_list: {recipient_list}")
                        
                        result = send_mail(
                            subject="[YourConnect] 검색 결과가 도착했습니다! ✨",
                            message="이메일을 HTML 형식으로 확인하세요.",
                            from_email="yourconnect100@gmail.com",
                            recipient_list=recipient_list,  # ⭐ 명시적으로 리스트 전달
                            html_message=html_content,
                            fail_silently=False
                        )
                        logger.info(f"✅ [{user_email}] 이메일 발송 완료 (결과: {result})")
                        print(f"✅ [{user_email}] 이메일 발송 완료 (결과: {result})")
                    except Exception as e:
                        logger.error(f"❌ 이메일 발송 오류: {e}")
                        print(f"❌ 이메일 발송 오류: {e}")
                else:
                    logger.warning(f"⚠️ {user_username}: 이메일 주소가 없음")
                    print(f"⚠️ {user_username}: 이메일 주소가 없음")
            
            except Exception as e:
                import traceback
                print(f"❌ 크롤링 중 오류: {e}")
                print(traceback.format_exc())
        
        # 백그라운드 스레드에서 실행
        thread = threading.Thread(target=run_crawl_and_send)
        thread.daemon = True
        thread.start()
        
        return JsonResponse({
            "message": f"✅ 크롤링이 시작되었습니다.",
            "details": f"잠시 후 {user_email}로 이메일을 받으실 수 있습니다.",
            "user": {
                "username": user_username,
                "email": user_email,
                "search_keyword": search_keyword if 'search_keyword' in locals() else duty
            }
        })
    
    except Exception as e:
        import traceback
        print(f"❌ 오류: {e}")
        print(traceback.format_exc())
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
    GET /api/crawl-results/?duty=개발&subDuties=FE,BE&career=1년~3년&regions=서울,경기
    
    저장된 크롤링 결과를 반환합니다.
    """
    try:
        duty = request.GET.get('duty', '')
        subDuties_str = request.GET.get('subDuties', '')
        career = request.GET.get('career', '')
        regions_str = request.GET.get('regions', '')
        
        # 문자열을 배열로 변환
        subDuties_raw = [s.strip() for s in subDuties_str.split(',')] if subDuties_str else []
        regions_raw = [r.strip() for r in regions_str.split(',')] if regions_str else []

        base_dir = os.path.join(os.getcwd(), "crawl_results")

        # 여러 지역을 "_"로 구분하여 파일명 생성 (순서 정렬하여 일관성 유지)
        sorted_regions = sorted(set(regions_raw)) if regions_raw else []
        region_str = "_".join(sorted_regions) if sorted_regions else ""
        filter_key, cleaned_sub_duties = _build_filter_key(duty, subDuties_raw, career, region_str)
        result_path = os.path.join(base_dir, f"results_filter_{filter_key}.json")

        legacy_key = _legacy_filter_key(duty, subDuties_raw, career, region_str)
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
    GET /api/crawl-status/?duty=개발&subDuties=FE,BE&career=1년~3년&regions=서울,경기
    
    크롤링이 완료되었는지 확인합니다.
    """
    try:
        duty = request.GET.get('duty', '')
        subDuties_str = request.GET.get('subDuties', '')
        career = request.GET.get('career', '')
        regions_str = request.GET.get('regions', '')
        
        # 문자열을 배열로 변환
        subDuties_raw = [s.strip() for s in subDuties_str.split(',')] if subDuties_str else []
        regions_raw = [r.strip() for r in regions_str.split(',')] if regions_str else []
        
        base_dir = os.path.join(os.getcwd(), "crawl_results")
        # 여러 지역을 "_"로 구분하여 파일명 생성 (순서 정렬하여 일관성 유지)
        sorted_regions = sorted(set(regions_raw)) if regions_raw else []
        region_str = "_".join(sorted_regions) if sorted_regions else ""
        filter_key, _ = _build_filter_key(duty, subDuties_raw, career, region_str)
        result_path = os.path.join(base_dir, f"results_filter_{filter_key}.json")
        
        exists = os.path.exists(result_path)
        return JsonResponse({"completed": exists})
    
    except Exception as e:
        return JsonResponse({"error": str(e), "completed": False}, status=500)


# ✅ 현재 로그인 상태 확인 API
@csrf_exempt
@require_http_methods(["GET"])
def check_login_status(request):
    """
    현재 로그인한 사용자 정보 반환
    GET /api/check-login/
    """
    if request.user.is_authenticated:
        return JsonResponse({
            "logged_in": True,
            "username": request.user.username,
            "email": request.user.email,
            "id": request.user.id
        })
    else:
        return JsonResponse({
            "logged_in": False,
            "message": "로그인되지 않음"
        })

