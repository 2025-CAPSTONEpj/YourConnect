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
    name: '',
    birth: '',
    gender: '',
    email: '',
    marketing: ''
  });

  const API_BASE_URL = 'http://localhost:8000';

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

  const loadAndDisplaySpecs = async () => {
    try {
      setLoading(true);
      
      // localStorage에서 이전 사용자의 스펙 데이터 정리
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('userSpecs')) {
          localStorage.removeItem(key);
        }
      });
      
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE_URL}/api/specs/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`스펙 로드 실패: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 Loaded specs from API:', data.specs);
      
      if (data.specs && data.specs.length > 0) {
        const formattedSpecs = data.specs.map(spec => {
          // description에서 duty와 subDuty 파싱 (형식: "개발 - FE")
          let duty = '';
          let subDuty = '';
          
          if (spec.description) {
            const parts = spec.description.split(' - ');
            duty = parts[0] || '';
            subDuty = parts[1] || '';
          }
          
          return {
            id: spec.id,
            duty: duty,
            subDuty: subDuty,
            companyName: spec.company,
            career: spec.career_type || '경력 없음',
            position: spec.role,
            region: spec.region || '',
            skills: spec.skills || '',
            savedAt: spec.created_at
          };
        });
        console.log('✅ Formatted specs:', formattedSpecs);
        setSpecs(formattedSpecs);
      } else {
        console.log('❌ No specs found');
        setSpecs([]);
      }
    } catch (e) {
      console.error('⚠️ Error loading specs:', e);
      setError(e.message);
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