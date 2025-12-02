import React from 'react';
import './Advertisement.css';

function Advertisement() {
  return (
    <aside className="advertisement-card">
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