import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileSetting.css';

function ProfileSetting() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [specs, setSpecs] = useState([]);
  const [selectedSpecId, setSelectedSpecId] = useState(null);
  const [form, setForm] = useState({
    type: '일반',
    name: '',
    birth: '',
    gender: '',
    email: '',
    password: '',
    marketing: '비동의'
  });

  const API_BASE_URL = 'http://localhost:8000';

  const duties = ["개발", "데이터", "인공지능/머신러닝", "디자인", "QA/테스트"];
  const subDuties = {
    "개발": ["FE", "BE", "APP"],
    "데이터": ["데이터 분석가", "데이터 엔지니어", "머신러닝 엔지니어"],
    "인공지능/머신러닝": ["머신러닝 엔지니어", "AI 연구원", "데이터 사이언티스트"],
    "디자인": ["UIUX", "BX", "그래픽 디자이너", "모션 디자이너"],
    "QA/테스트": ["QA", "테스트 엔지니어"]
  };

  useEffect(() => {
    // localStorage에서 기존 개인정보 불러오기
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      try {
        const parsed = JSON.parse(savedUserInfo);
        console.log('📋 localStorage에서 로드:', parsed);
        setForm({
          ...form,
          ...parsed,
          password: '', // 비밀번호는 빈 값으로 유지
          marketing: parsed.marketing || '비동의' // 기본값 설정
        });
      } catch (e) {
        console.error('개인정보 로드 오류:', e);
      }
    }

    // API에서 보유 스펙 불러오기
    loadSpecs();
  }, []);

  const loadSpecs = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await fetch(`${API_BASE_URL}/api/specs/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('스펙 로드 실패:', response.status);
        return;
      }
      
      const data = await response.json();
      if (data.specs && data.specs.length > 0) {
        const formattedSpecs = data.specs.map(spec => {
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
            region: spec.region || ''
          };
        });
        setSpecs(formattedSpecs);
      }
    } catch (e) {
      console.error('Error loading specs:', e);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  const handleGenderSelect = (gender) => {
    setForm({
      ...form,
      gender: gender
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name) {
      alert('이름을 입력해주세요.');
      return;
    }
    
    if (!form.email) {
      alert('이메일을 입력해주세요.');
      return;
    }
    
    if (!form.birth) {
      alert('생년월일을 입력해주세요.');
      return;
    }
    
    if (!form.gender) {
      alert('성별을 선택해주세요.');
      return;
    }
    
    // localStorage에 개인정보 저장
    const userInfoToSave = {
      type: form.type,
      name: form.name,
      birth: form.birth,
      gender: form.gender,
      email: form.email,
      marketing: form.marketing
    };
    
    localStorage.setItem('userInfo', JSON.stringify(userInfoToSave));
    console.log('💾 localStorage에 저장:', userInfoToSave);
    
    // 서버에도 저장
    try {
      const token = localStorage.getItem('access_token');
      const genderValue = form.gender === '남자' ? 'male' : 'female';
      
      const updateData = {
        name: form.name,
        birth: form.birth,
        gender: genderValue,
        role: form.type === '멘토' ? 'mentor' : 'user',
        agree_ad: form.marketing === '동의'
      };
      
      console.log('📤 서버로 전송할 데이터:', updateData);
      
      const response = await fetch(`${API_BASE_URL}/api/auth/profile/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('서버 응답 오류:', errorData);
        alert('서버 저장 실패: ' + JSON.stringify(errorData));
        return;
      }
      
      const responseData = await response.json();
      console.log('✅ 서버에 저장 성공:', responseData);
      alert('개인정보가 저장되었습니다!');
    } catch (e) {
      console.error('❌ 서버 저장 오류:', e);
      alert('서버 저장 중 오류 발생: ' + e.message);
      return;
    }
    
    alert('개인정보가 저장되었습니다.');
    navigate('/profile');
  };

  const handleCancel = () => {
    navigate('/profile');
  };

  return (
    <div className="profilesetting-page">
      <div className="profilesetting-container">
        <h1 className="profilesetting-title">개인정보 수정</h1>
        
        <form className="profilesetting-form" onSubmit={handleSubmit}>
          {/* 가입 유형 */}
          <div className="form-section">
            <label className="form-label">가입 유형</label>
            <div className="radio-group">
              <label>
                <input 
                  type="radio" 
                  name="type" 
                  value="일반"
                  checked={form.type === '일반'}
                  onChange={handleChange}
                />
                일반 가입
              </label>
              <label>
                <input 
                  type="radio" 
                  name="type" 
                  value="멘토"
                  checked={form.type === '멘토'}
                  onChange={handleChange}
                />
                멘토 가입
              </label>
            </div>
          </div>

          {/* 이름 */}
          <div className="form-section">
            <label className="form-label">이름</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="이름을 입력하세요"
            />
          </div>

          {/* 생년월일 */}
          <div className="form-section">
            <label className="form-label">생년월일</label>
            <input
              type="date"
              name="birth"
              value={form.birth}
              onChange={handleChange}
            />
          </div>

          {/* 성별 */}
          <div className="form-section">
            <label className="form-label">성별</label>
            <div className="gender-buttons">
              <button
                type="button"
                className={`gender-btn ${form.gender === '남자' ? 'selected' : ''}`}
                onClick={() => handleGenderSelect('남자')}
              >
                남자
              </button>
              <button
                type="button"
                className={`gender-btn ${form.gender === '여자' ? 'selected' : ''}`}
                onClick={() => handleGenderSelect('여자')}
              >
                여자
              </button>
            </div>
          </div>

          {/* 이메일 */}
          <div className="form-section">
            <label className="form-label">이메일</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="example@email.com"
            />
          </div>

          {/* 비밀번호 */}
          <div className="form-section">
            <label className="form-label">비밀번호</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="비밀번호를 변경하려면 입력하세요"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* 마케팅 수신 동의 */}
          <div className="form-section">
            <label className="form-label">마케팅 수신 동의</label>
            <div className="radio-group">
              <label>
                <input 
                  type="radio" 
                  name="marketing" 
                  value="동의"
                  checked={form.marketing === '동의'}
                  onChange={handleChange}
                />
                동의
              </label>
              <label>
                <input 
                  type="radio" 
                  name="marketing" 
                  value="비동의"
                  checked={form.marketing === '비동의'}
                  onChange={handleChange}
                />
                비동의
              </label>
            </div>
          </div>

          {/* 보유 스펙 선택 */}
          {specs.length > 0 && (
            <div className="form-section">
              <label className="form-label">보유 스펙</label>
              <div className="spec-selection-list">
                {specs.map(spec => (
                  <div key={spec.id} className="spec-selection-item">
                    <label>
                      <input
                        type="radio"
                        name="selectedSpec"
                        value={spec.id}
                        checked={selectedSpecId === spec.id}
                        onChange={(e) => setSelectedSpecId(parseInt(e.target.value))}
                      />
                      <div className="spec-info">
                        <strong>{spec.companyName}</strong>
                        {spec.duty && <span>{spec.duty}</span>}
                        {spec.subDuty && <span> - {spec.subDuty}</span>}
                        {spec.career && <span className="career-badge">{spec.career}</span>}
                        {spec.region && <span className="region-badge">{spec.region}</span>}
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 버튼 영역 */}
          <div className="button-group">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              취소
            </button>
            <button type="submit" className="submit-btn">
              저장하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfileSetting;
