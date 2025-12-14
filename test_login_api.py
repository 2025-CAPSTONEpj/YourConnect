#!/usr/bin/env python
"""
현재 로그인 상태 확인 API 추가
"""
import json
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt

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
