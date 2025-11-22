import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './common.css'; 

function LoggedInProfile() {
  const [position, setPosition] = useState({ x: window.innerWidth - 330, y: 140 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isManuallyMoved, setIsManuallyMoved] = useState(false);

  const handleMouseDown = (e) => {
    // 링크나 버튼 클릭 시 드래그 방지
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      return;
    }
    
    setIsDragging(true);
    setIsManuallyMoved(true);
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

  // 창 크기 변경 시 위치 재계산
  useEffect(() => {
    const handleResize = () => {
      if (!isManuallyMoved) {
        const newX = window.innerWidth - 330;
        const newY = 140;
        setPosition({ x: newX, y: newY });
        
        // 광고 컴포넌트에게 위치 변경 알림
        window.dispatchEvent(new CustomEvent('miniProfileMove', { 
          detail: { x: newX, y: newY }
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isManuallyMoved]);

  return (
    <div 
      className="profile-container mini-profile-card logged-in-profile"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        position: 'fixed',
        userSelect: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="logged-profile-content">
        <div className="logged-profile-header">
          <img 
            src={`${process.env.PUBLIC_URL}/user.png`} 
            alt="프로필 이미지" 
            className="logged-profile-img" 
          />
          <div className="logged-profile-info">
            <h4 className="logged-profile-name">이가윤님 👩🏻‍💻</h4>
          </div>
        </div>
        <Link to="/profile" className="logged-profile-edit-link">
          회원정보 수정
        </Link>
      </div>
    </div>
  );
}

export default LoggedInProfile;
