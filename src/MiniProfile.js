import React from 'react';
import { Link } from 'react-router-dom';
import './common.css'; 

function MiniProfile() {
  return (
    <div className="profile-container mini-profile-card">
      <Link to="/login" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="profile-content">
          <img src={`${process.env.PUBLIC_URL}/user.png`} alt="사용자 아이콘" className="user-icon" />
          <p className="profile-text">로그인이 필요합니다.</p>
        </div>
      </Link>
      <div className="profile-footer">
        <a href="#find-id" className="footer-link">아이디 찾기</a>
        <div className="divider"></div>
        <a href="#find-pw" className="footer-link">비밀번호 찾기</a>
      </div>
    </div>
  );
}

export default MiniProfile;