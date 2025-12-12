"""
스펙(경력) 관련 API 엔드포인트
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
import base64
from .models import User, Experience
from datetime import datetime


def get_user_from_token(request):
    """
    Authorization 헤더에서 Bearer 토큰을 추출하고 사용자를 반환
    토큰 형식: Bearer {base64_encoded_user_id:email}
    """
    auth_header = request.headers.get('Authorization', '')
    
    if not auth_header.startswith('Bearer '):
        return None
    
    try:
        token = auth_header[7:]  # 'Bearer ' 제거
        decoded = base64.b64decode(token).decode('utf-8')
        user_id, email = decoded.split(':')
        user = User.objects.get(id=int(user_id), email=email)
        return user
    except Exception as e:
        print(f"Token authentication error: {e}")
        return None


@csrf_exempt
@require_http_methods(["GET"])
def get_specs_api(request):
    """
    GET /api/specs/
    현재 로그인된 사용자의 모든 경력(스펙) 조회
    """
    try:
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({"error": "로그인이 필요합니다."}, status=401)
        experiences = Experience.objects.filter(user=user).order_by('-created_at')
        
        specs = []
        for exp in experiences:
            specs.append({
                'id': exp.id,
                'company': exp.company,
                'role': exp.role,
                'career_type': exp.career_type,
                'region': exp.region or '',
                'start_date': exp.start_date.isoformat() if exp.start_date else None,
                'end_date': exp.end_date.isoformat() if exp.end_date else None,
                'skills': exp.skills,
                'description': exp.description,
                'created_at': exp.created_at.isoformat()
            })
        
        return JsonResponse({
            "message": "경력 조회 성공",
            "count": len(specs),
            "specs": specs
        })
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def save_spec_api(request):
    """
    POST /api/specs/save/
    새로운 경력(스펙) 저장
    
    요청 데이터:
    {
        "company": "회사명",
        "role": "직급/역할",
        "career_type": "정규직|인턴|프로젝트|기타",
        "start_date": "2020-01-01",
        "end_date": "2022-12-31",
        "skills": "Python, Django, React",
        "description": "설명"
    }
    """
    try:
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({"error": "로그인이 필요합니다."}, status=401)
        
        data = json.loads(request.body)
        
        # 필수 필드 검증
        company = data.get('company', '').strip()
        role = data.get('role', '').strip()
        
        if not company or not role:
            return JsonResponse({"error": "회사명과 직급은 필수입니다."}, status=400)
        
        # 경력 정보 저장
        try:
            start_date = datetime.strptime(data.get('start_date', ''), '%Y-%m-%d').date() if data.get('start_date') else None
            end_date = datetime.strptime(data.get('end_date', ''), '%Y-%m-%d').date() if data.get('end_date') else None
        except ValueError:
            return JsonResponse({"error": "날짜 형식이 잘못되었습니다. (YYYY-MM-DD)"}, status=400)
        
        experience = Experience.objects.create(
            user=user,
            company=company,
            role=role,
            career_type=data.get('career_type', ''),
            region=data.get('region', ''),
            start_date=start_date,
            end_date=end_date,
            skills=data.get('skills', ''),
            description=data.get('description', '')
        )
        
        return JsonResponse({
            "message": "경력 저장 성공",
            "spec": {
                'id': experience.id,
                'company': experience.company,
                'role': experience.role,
                'career_type': experience.career_type,
                'region': experience.region or '',
                'start_date': experience.start_date.isoformat() if experience.start_date else None,
                'end_date': experience.end_date.isoformat() if experience.end_date else None,
                'skills': experience.skills,
                'description': experience.description
            }
        })
    
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_spec_api(request, spec_id):
    """
    DELETE /api/specs/{spec_id}/
    특정 경력(스펙) 삭제
    """
    try:
        user = get_user_from_token(request)
        if not user:
            return JsonResponse({"error": "로그인이 필요합니다."}, status=401)
        
        try:
            experience = Experience.objects.get(id=spec_id, user=user)
            experience.delete()
            return JsonResponse({"message": "경력 삭제 성공"})
        except Experience.DoesNotExist:
            return JsonResponse({"error": "해당 경력을 찾을 수 없습니다."}, status=404)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
