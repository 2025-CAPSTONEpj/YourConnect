import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === "/login";
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("access_token");
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();
    
    // storage 이벤트 리스너 (다른 탭에서 로그인/로그아웃 시)
    window.addEventListener('storage', checkLoginStatus);
    // 커스텀 이벤트 리스너 (같은 탭에서 로그인/로그아웃 시)
    window.addEventListener('loginStatusChanged', checkLoginStatus);

    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('loginStatusChanged', checkLoginStatus);
    };
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event('loginStatusChanged'));
    alert("로그아웃되었습니다.");
    navigate('/');
  };

  return (
    <header className="header-main">
      <nav className="nav-container">
        {/* 로고 클릭 시 메인 페이지로 이동 */}
        <div className="logo-area">
          <Link to="/">
            <img src={`${process.env.PUBLIC_URL}/logo.png`} alt="CareerBuddy 로고" className="logo-img" />
          </Link>
        </div>

        {/* 로그인 페이지가 아닐 때만 메뉴 표시 */}
        {!isLoginPage && (
          <div className="menu-category-group">
            <Link to="/ai-interview" className="menu-item font-bold text-lg hover-purple">
              맞춤형 커리어 디자인🖥️
            </Link>
            <Link to="/mentoring" className="menu-item font-bold text-lg hover-purple">
              멘토링🤝🏼
            </Link>
            <Link to="/headhunting" className="menu-item font-bold text-lg hover-purple">
              헤드 헌팅🏢
              </Link>
          </div>
        )}

        {/* 로그인 페이지가 아닐 때만 인증 버튼 표시 */}
        {!isLoginPage && (
          <div className="auth-group">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="btn btn-primary">
                로그아웃
              </button>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary">
                  로그인
                </Link>
                <Link to="/signup" className="btn btn-secondary">회원가입</Link>
              </>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;