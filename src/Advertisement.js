import React, { useState, useEffect } from 'react';
import './Advertisement.css';

function Advertisement() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // 초기 위치 설정 (MiniProfile 아래)
    const initialX = window.innerWidth - 330;
    const initialY = 140 + 180; // MiniProfile 높이 + 여백
    setPosition({ x: initialX, y: initialY });

    // MiniProfile의 위치 변경 감지
    const handleMiniProfileMove = (e) => {
      const miniProfilePos = e.detail;
      setPosition({
        x: miniProfilePos.x,
        y: miniProfilePos.y + 180 // MiniProfile 높이 + 여백
      });
    };

    window.addEventListener('miniProfileMove', handleMiniProfileMove);

    return () => {
      window.removeEventListener('miniProfileMove', handleMiniProfileMove);
    };
  }, []);

  return (
    <aside 
      className="advertisement-card"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
    >
      <div className="ad-container">
        <div className="ad-header">
          <span className="ad-label">SPONSORED</span>
        </div>
        <div className="ad-content">
          <div className="ad-icon">📢</div>
          <h3 className="ad-title">프리미엄 멤버십</h3>
          <p className="ad-description">
            더 많은 멘토링 기회와<br />
            맞춤형 채용 정보를<br />
            받아보세요!
          </p>
          <button className="ad-cta-button">자세히 보기</button>
        </div>
        <div className="ad-features">
          <div className="ad-feature-item">
            <span className="feature-icon">✓</span>
            <span>무제한 멘토링 신청</span>
          </div>
          <div className="ad-feature-item">
            <span className="feature-icon">✓</span>
            <span>AI 기반 채용 추천</span>
          </div>
          <div className="ad-feature-item">
            <span className="feature-icon">✓</span>
            <span>우선 지원 기회</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Advertisement;