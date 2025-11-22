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
      const response = await fetch("http://172.16.101.243:8000/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        email: username,
        password: password,
        }),
    });

      const data = await response.json();
      console.log("서버 응답:", data);

      if (data.access) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        // 로그인 상태 변경 이벤트 발생
        window.dispatchEvent(new Event('loginStatusChanged'));
        
        alert("로그인 성공! 메인 페이지로 이동합니다.");
        navigate('/');
      } else {
        alert("로그인 실패: 이메일 또는 비밀번호를 확인해주세요.");
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
            Google로 로그인
          </button>
          <button type="button" className={`${styles['social-btn']} ${styles['kakao-btn']}`} onClick={() => handleSocialLogin('Kakao')}>
            카카오로 로그인
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
