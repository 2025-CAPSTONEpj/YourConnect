import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LoginForm.module.css';
import myLogo from './logo.png';  

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("로그인 요청:", username, password);

    try {
      const response = await fetch("http://localhost:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
      });

      const data = await response.json();
      console.log("서버 응답:", data);

      if (response.ok) {
        // 로그인 성공 - 사용자 정보 저장
        const userData = data.user || data;
        
        // 토큰 저장
        if (data.access) {
          localStorage.setItem("access_token", data.access);
        }
        
        const userInfo = {
          type: userData.role === 'mentor' ? '멘토' : '일반',
          name: userData.first_name || userData.name || '',
          email: userData.email || username,
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        console.log('사용자 정보 저장 완료:', userInfo);

        // 로그인 상태 변경 이벤트 발생
        window.dispatchEvent(new Event('loginStatusChanged'));
        
        alert("로그인 성공! 메인 페이지로 이동합니다.");
        navigate('/');
      } else {
        alert("로그인 실패: " + (data.error || "이메일 또는 비밀번호를 확인해주세요."));
      }

    } catch (error) {
      console.error("로그인 오류:", error);
      alert("서버와 연결할 수 없습니다. Django 서버가 켜져 있는지 확인하세요!");
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`${provider} 계정으로 로그인합니다.`);
  };

  return (
    <div className={styles['login-page-wrapper']}>
      <div className={styles['login-box']}>
        <Link to="/">
          <img src={myLogo} alt="회사 로고" className={styles['login-logo']} />
        </Link>
        <form onSubmit={handleSubmit}>
          <h2>로그인</h2>
          <div className={styles['input-group']}>
            <input
              type="text"
              placeholder="이메일을 입력해주세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className={styles['input-group']}>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className={styles['login-btn']}>로그인</button>
        </form>

        <div className={styles['separator']}>
          <span>또는</span>
        </div>

        <div className={styles['social-login']}>
          <button type="button" className={`${styles['social-btn']} ${styles['google-btn']}`} onClick={() => handleSocialLogin('Google')}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Google로 로그인
          </button>
          <button type="button" className={`${styles['social-btn']} ${styles['naver-btn']}`} onClick={() => handleSocialLogin('Naver')}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.147 9.927L5.853 0H0v18h5.853V8.073L12.147 18H18V0h-5.853v9.927z" fill="white"/>
            </svg>
            네이버로 로그인
          </button>
          <button type="button" className={`${styles['social-btn']} ${styles['kakao-btn']}`} onClick={() => handleSocialLogin('Kakao')}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 0C4.029 0 0 3.359 0 7.5c0 2.656 1.746 4.992 4.406 6.328-.186.691-.605 2.25-.696 2.602-.114.422.155.416.327.302.139-.092 2.177-1.462 3.02-2.031.644.088 1.302.134 1.943.134 4.971 0 9-3.359 9-7.5S13.971 0 9 0z" fill="#191919"/>
            </svg>
            카카오로 로그인
          </button>
        </div>

        <div className={styles['footer-links']}>
          <a href="#find-email" className={styles['footer-link']}>이메일 찾기</a>
          <span className={styles['link-divider']}>|</span>
          <a href="#find-password" className={styles['footer-link']}>비밀번호 찾기</a>
          <span className={styles['link-divider']}>|</span>
          <Link to="/signup" className={styles['footer-link']}>회원가입</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;