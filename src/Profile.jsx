import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';

function Profile() {
  const navigate = useNavigate();
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState({
    type: '일반',
    name: '이가윤',
    birth: '1998-05-15',
    gender: '여자',
    email: 'example@email.com',
    marketing: '동의'
  });

  const API_BASE_URL = 'http://192.168.225.44:8000';

  useEffect(() => {
    loadAndDisplaySpecs();
    loadUserInfo();
    
    const handlePageShow = () => {
      loadAndDisplaySpecs();
      loadUserInfo();
    };
    
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const loadAndDisplaySpecs = () => {
    try {
      setLoading(true);
      const savedSpecs = localStorage.getItem('userSpecs');
      console.log('📦 Loaded specs from localStorage:', savedSpecs);
      
      if (savedSpecs) {
        const parsed = JSON.parse(savedSpecs);
        const specsArray = Array.isArray(parsed) ? parsed : [parsed];
        const withIds = specsArray.map((spec, idx) => ({
          ...spec,
          id: spec.id || `spec-${Date.now()}-${idx}`
        }));
        console.log('✅ Parsed specs:', withIds);
        setSpecs(withIds);
      } else {
        console.log('❌ No specs found in localStorage');
        setSpecs([]);
      }
    } catch (e) {
      console.error('⚠️ Error loading specs:', e);
      setSpecs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserInfo = () => {
    const savedUserInfo = localStorage.getItem('userInfo');
    
    if (savedUserInfo) {
      try {
        const parsed = JSON.parse(savedUserInfo);
        setUserInfo(parsed);
      } catch (e) {
        console.error('개인정보 로드 오류:', e);
      }
    }
  };

  const calculateTotalCareer = () => {
    if (specs.length === 0) {
      return '경력 없음';
    }
    
    // 첫 번째(유일한) 스펙의 경력 반환
    const spec = specs[0];
    return spec.career || '경력 없음';
  };

  const handleEditSpec = () => {
    navigate('/spec');
  };

  const handleCreateSpec = () => {
    navigate('/spec');
  };

  return (
    <div className="profile-main-container">
      {/* 상단 영역: 프로필 + 스펙 정보 통합 */}
      <section className="profile-spec-combined">
        {/* 상단: 프로필 이미지와 정보 */}
        <div className="profile-header-row">
          <div className="profile-img" aria-hidden="true">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.2" />
              <path d="M4 21c1.5-4 6.5-6 8-6s6.5 2 8 6" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.2" />
            </svg>
          </div>
          <div className="profile-info-section">
            <div className="profile-name-row">
              <h2 className="profile-name">{userInfo.name}</h2>
              <p className="profile-membership">멤버십 구분: <strong>PRO</strong></p>
            </div>
            <p className="profile-membership-link">
              <a href="#" className="membership-link">멤버십 관리 페이지 바로가기 &gt;</a>
            </p>
          </div>
        </div>

        {/* 하단: 스펙 정보 */}
        <div className="spec-info-section">
          <h3 className="spec-section-title">내 스펙 정보</h3>
          <div className="spec-content-box">
            {loading ? (
              <div className="no-spec-container">
                <p className="no-spec-message">로딩 중...</p>
              </div>
            ) : specs.length === 0 ? (
              <div className="no-spec-container">
                <p className="no-spec-message">아직 작성된 정보가 없습니다.</p>
                <button className="create-spec-btn" onClick={handleCreateSpec}>
                  작성하기
                </button>
              </div>
            ) : (
              <div className="spec-items-list">
                <div className="total-career">
                  <strong>총 경력:</strong> {calculateTotalCareer()}
                </div>
                <button className="edit-btn" onClick={handleEditSpec}>
                  스펙 수정
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 개인정보 표시 영역 */}
      <section className="profile-detail">
        <h3 className="section-title">개인정보</h3>
        <div className="info-display">
          <div className="info-row">
            <span className="info-label">가입 유형</span>
            <span className="info-value">{userInfo.type} 가입</span>
          </div>
          <div className="info-row">
            <span className="info-label">이름</span>
            <span className="info-value">{userInfo.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">생년월일</span>
            <span className="info-value">{userInfo.birth}</span>
          </div>
          <div className="info-row">
            <span className="info-label">성별</span>
            <span className="info-value">{userInfo.gender}</span>
          </div>
          <div className="info-row">
            <span className="info-label">이메일</span>
            <span className="info-value">{userInfo.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">비밀번호</span>
            <span className="info-value">••••••••</span>
          </div>
          <div className="info-row">
            <span className="info-label">마케팅 수신 동의</span>
            <span className="info-value">{userInfo.marketing}</span>
          </div>
        </div>
        <div className="edit-btn-wrap">
          <button className="edit-info-btn" onClick={() => navigate('/profilesetting')}>
            개인정보 수정
          </button>
        </div>
      </section>
    </div>
  );
}

export default Profile;