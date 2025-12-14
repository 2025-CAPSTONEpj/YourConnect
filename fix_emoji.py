import re

with open('src/Headhunting.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# "이메일로 결과 받기" 앞의 모든 비ASCII, 비한글 문자 제거
content = content.replace('📧 이메일로 결과 받기', '이메일로 결과 받기')
content = re.sub(r'[^\w가-힣\s]이메일로 결과 받기', '이메일로 결과 받기', content)

with open('src/Headhunting.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 기호 제거 완료")
