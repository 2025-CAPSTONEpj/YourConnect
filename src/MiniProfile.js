import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './common.css'; 

function MiniProfile() {
  const [position, setPosition] = useState({ x: window.innerWidth - 330, y: 140 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    // 링크나 버튼 클릭 시 드래그 방지
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      return;
    }
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      setPosition(newPosition);
      
      // 광고 컴포넌트에게 위치 변경 알림
      window.dispatchEvent(new CustomEvent('miniProfileMove', { 
        detail: newPosition 
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, position]);

  return (
    <div 
      className="profile-container mini-profile-card"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        position: 'fixed',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
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