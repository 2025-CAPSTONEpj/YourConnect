from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import User


# -----------------------------
# 프로필 수정 (로그인 필요)
# -----------------------------
class ProfileEditAPI(APIView):
    permission_classes = [IsAuthenticated]  # JWT 인증 필요

    def post(self, request):
        user = request.user

        spec_job = request.data.get('spec_job')
        desired_job = request.data.get('desired_job')

        if not spec_job and not desired_job:
            return Response(
                {"error": "spec_job 또는 desired_job 중 하나는 포함되어야 합니다."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if spec_job:
            user.spec_job = spec_job

        if desired_job:
            user.desired_job = desired_job

        user.save()

        return Response({
            "message": "Profile updated successfully",
            "user": {
                "email": user.email,
                "spec_job": user.spec_job,
                "desired_job": user.desired_job
            }
        }, status=status.HTTP_200_OK)
