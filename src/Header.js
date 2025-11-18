import React from "react";
import { Link, useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

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

        {/* 로그인 페이지가 아닐 때만 로그인/회원가입 버튼 표시 */}
        {!isLoginPage && (
          <div className="auth-group">
            <Link to="/login" className="btn btn-primary">
              로그인
            </Link>
            <a href="#cta" className="btn btn-secondary">회원가입</a>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;