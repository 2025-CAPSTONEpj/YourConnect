@echo off
REM 이메일 발송 스크립트
REM 사용법: send_email.bat

cd /d "%~dp0"

echo.
echo ===============================================
echo  YourConnect 크롤링 결과 이메일 발송
echo ===============================================
echo.

python test_email_final.py

pause
