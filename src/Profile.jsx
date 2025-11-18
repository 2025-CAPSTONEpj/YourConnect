import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './profile.css';

function Profile() {
  const navigate = useNavigate();
  const [specs, setSpecs] = useState([]);

  useEffect(() => {
    loadAndDisplaySpecs();
    
    const handlePageShow = () => {
      loadAndDisplaySpecs();
    };
    
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const loadAndDisplaySpecs = () => {
    const savedSpecs = localStorage.getItem('userSpecs');
    
    if (!savedSpecs) {
      setSpecs([]);
      return;
    }

    try {
      const parsed = JSON.parse(savedSpecs);
      const specsArray = Array.isArray(parsed) ? parsed : [parsed];
      setSpecs(specsArray);
    } catch (e) {
      console.error('스펙 로드 오류:', e);
      setSpecs([]);
    }
  };

  const calculateTotalCareer = () => {
    let totalYears = 0;
    let totalMonths = 0;
    
    specs.forEach(spec => {
      if (spec.careers && spec.careers.length > 0) {
        const careerStr = spec.careers[0];
        const yearMatch = careerStr.match(/(\d+)년/);
        const monthMatch = careerStr.match(/(\d+)개월/);
        
        if (yearMatch) totalYears += parseInt(yearMatch[1]);
        if (monthMatch) totalMonths += parseInt(monthMatch[1]);
      }
    });
    
    totalYears += Math.floor(totalMonths / 12);
    totalMonths = totalMonths % 12;
    
    if (totalYears === 0 && totalMonths === 0) {
      return '경력 없음';
    } else if (totalYears === 0) {
      return `${totalMonths}개월`;
    } else if (totalMonths === 0) {
      return `${totalYears}년`;
    } else {
      return `${totalYears}년 ${totalMonths}개월`;
    }
  };

  const handleEditSpec = () => {
    navigate('/spec');
  };

  const handleCreateSpec = () => {
    navigate('/spec');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const modal = document.getElementById('saveModal');
    if (modal) {
      modal.setAttribute('aria-hidden', 'false');
      modal.classList.add('open');
    }
  };

  const handleModalClose = () => {
    const modal = document.getElementById('saveModal');
    if (modal) {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
    }
  };

  return (
    <div className="profile-main-container">
      {/* 상단 프로필 요약 */}
      <section className="profile-top">
        {/* 왼쪽: 프로필 이미지 */}
        <div className="profile-left">
          <div className="profile-img" aria-hidden="true">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
              <circle cx="12" cy="8" r="3.5" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.2" />
              <path d="M4 21c1.5-4 6.5-6 8-6s6.5 2 8 6" fill="#f3f4f6" stroke="#9ca3af" strokeWidth="1.2" />
            </svg>
          </div>
        </div>
        
        {/* 오른쪽: 이름, 멤버십, 스펙 정보 */}
        <div className="profile-right">
          <div className="profile-header">
            <h2 className="name">이가윤</h2>
            <p className="membership">멤버십 구분: <strong>PRO</strong></p>
            <p className="pro-tag">
              <a href="#" className="membership-link">멤버십 관리 페이지 바로가기 &gt;</a>
            </p>
          </div>

          <div id="specDisplay" className="spec-display-box">
            <h3 className="spec-display-title">내 스펙 정보</h3>
            <div id="specContent" className="spec-content">
              {specs.length === 0 ? (
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
        </div>
      </section>

      {/* 개인정보 수정 영역 */}
      <section className="profile-detail">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>전화번호</label>
            <div className="phone-inputs">
              <input type="text" defaultValue="010" /> -
              <input type="text" maxLength="4" /> -
              <input type="text" maxLength="4" />
            </div>
          </div>

          <div className="form-row">
            <label>이메일</label>
            <input type="email" placeholder="example@email.com" />
          </div>

          <div className="form-row">
            <label>생년월일</label>
            <input type="date" />
          </div>

          <div className="form-row">
            <label>성별</label>
            <div>
              <label><input type="radio" name="gender" /> 남자</label>
              <label><input type="radio" name="gender" /> 여자</label>
            </div>
          </div>

          <div className="form-row">
            <label>마케팅 수신 동의</label>
            <div>
              <label><input type="radio" name="marketing" /> 동의</label>
              <label><input type="radio" name="marketing" /> 비동의</label>
            </div>
          </div>

          <div className="save-btn-wrap">
            <button type="submit" className="save-btn">저장하기</button>
          </div>
        </form>
      </section>

      {/* 저장 팝업 모달 */}
      <div id="saveModal" className="modal" aria-hidden="true">
        <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <p id="modalTitle">정보가 저장되었습니다</p>
          <button id="modalOk" className="save-btn" onClick={handleModalClose}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;