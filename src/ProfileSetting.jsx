import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileSetting.css';

function ProfileSetting() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    type: '일반',
    name: '이가윤',
    birth: '1998-05-15',
    gender: '여자',
    email: 'example@email.com',
    password: '',
    marketing: '동의'
  });

  useEffect(() => {
    // localStorage에서 기존 개인정보 불러오기
    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      try {
        const parsed = JSON.parse(savedUserInfo);
        setForm({
          ...form,
          ...parsed,
          password: '' // 비밀번호는 빈 값으로 유지
        });
      } catch (e) {
        console.error('개인정보 로드 오류:', e);
      }
    }
  }, []);

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

  const handleSubmit = (e) => {
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
