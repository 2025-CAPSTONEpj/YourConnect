import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import myLogo from "./logo.png";

export default function Signup() {
  const navigate = useNavigate();
  const [accountType, setAccountType] = useState("personal"); // "personal" or "company"
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    type: "",
    email: "",
    password: "",
    name: "",
    birth: "",
    gender: "",
    // 기업 회원 전용 필드
    companyName: "",
    businessNumber: "",
    hrName: "",
    hrPhone: "",
    hrEmail: "",
    agreeAll: false,
    agree14: false,
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // 전체 동의 체크박스
    if (name === "agreeAll") {
      setForm({
        ...form,
        agreeAll: checked,
        agree14: checked,
        agreeTerms: checked,
        agreePrivacy: checked,
        agreeMarketing: checked,
      });
      return;
    }

    // 개별 체크박스 변경
    const updatedForm = {
      ...form,
      [name]: type === "checkbox" ? checked : value,
    };

    // 개별 체크박스 변경 시 전체 동의 체크박스 상태 업데이트
    if (type === "checkbox" && ["agree14", "agreeTerms", "agreePrivacy", "agreeMarketing"].includes(name)) {
      const allChecked = 
        updatedForm.agree14 && 
        updatedForm.agreeTerms && 
        updatedForm.agreePrivacy && 
        updatedForm.agreeMarketing;
      updatedForm.agreeAll = allChecked;
    }

    setForm(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 공통 필수 항목 검증
    if (!form.email) {
      alert("이메일을 입력해주세요.");
      return;
    }
    
    if (!form.password) {
      alert("비밀번호를 입력해주세요.");
      return;
    }
    
    // 개인 회원 필수 항목
    if (accountType === "personal") {
      if (!form.type) {
        alert("가입 유형을 선택해주세요.");
        return;
      }
      
      if (!form.name) {
        alert("이름을 입력해주세요.");
        return;
      }
      
      if (!form.birth) {
        alert("생년월일을 입력해주세요.");
        return;
      }
      
      if (!form.gender) {
        alert("성별을 선택해주세요.");
        return;
      }
    }
    
    // 기업 회원 필수 항목
    if (accountType === "company") {
      if (!form.companyName) {
        alert("회사명을 입력해주세요.");
        return;
      }
      
      if (!form.businessNumber) {
        alert("사업자등록번호를 입력해주세요.");
        return;
      }
      
      if (!form.hrName) {
        alert("인사 담당자 이름을 입력해주세요.");
        return;
      }
      
      if (!form.hrPhone) {
        alert("인사 담당자 연락처를 입력해주세요.");
        return;
      }
      
      if (!form.hrEmail) {
        alert("인사 담당자 이메일을 입력해주세요.");
        return;
      }
    }
    
    if (!form.agree14) {
      alert("만 14세 이상 동의는 필수입니다.");
      return;
    }
    
    if (!form.agreeTerms) {
      alert("이용약관 동의는 필수입니다.");
      return;
    }
    
    if (!form.agreePrivacy) {
      alert("개인정보 수집 및 이용 동의는 필수입니다.");
      return;
    }
    
    // 모든 검증 성공 시 → Django 로 회원가입 요청
    const signupData = {
      account_type: accountType,      // personal / company
      email: form.email,
      password: form.password,
      name: form.name,
      birth: form.birth,
      gender: form.gender === '남자' ? 'male' : 'female',
      role: form.type === '멘토' ? 'mentor' : 'user',
      agree_age: form.agree14,
      agree_service: form.agreeTerms,
      agree_personal_info: form.agreePrivacy,
      agree_ad: form.agreeMarketing,
    };

    try {
      const response = await fetch("http://localhost:8000/api/auth/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();
      console.log("서버 응답:", data);

      if (response.ok) {
        // 회원가입한 정보를 localStorage에 저장 (개인 회원만)
        if (accountType === "personal") {
          const userInfo = {
            type: form.type,
            name: form.name,
            birth: form.birth,
            gender: form.gender,
            email: form.email,
            marketing: form.agreeMarketing ? '동의' : '비동의'
          };
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        }
        
        alert("회원가입 성공!");
        navigate("/login");
      } else {
        alert("회원가입 실패: " + JSON.stringify(data));
      }

    } catch (error) {
      console.error("회원가입 오류:", error);
      alert("서버 연결 실패. Django 서버가 켜져 있는지 확인하세요!");
    }
  };

  return (
    <>
      <div className="signup-header">
        <Link to="/">
          <img src={myLogo} alt="회사 로고" className="signup-logo" />
        </Link>
      </div>
      <div className="signup-container">
        <h2 className="title">회원가입</h2>
      
      {/* 계정 유형 탭 */}
      <div className="account-type-tabs">
        <button 
          type="button"
          className={`tab-button ${accountType === "personal" ? "active" : ""}`}
          onClick={() => setAccountType("personal")}
        >
          개인 회원
        </button>
        <button 
          type="button"
          className={`tab-button ${accountType === "company" ? "active" : ""}`}
          onClick={() => setAccountType("company")}
        >
          기업 회원
        </button>
      </div>
      
      <form className="signup-form" onSubmit={handleSubmit}>

        {/* 개인 회원 폼 */}
        {accountType === "personal" && (
          <>
            {/* 가입 유형 선택 */}
            <div className="section">
              <label className="section-title">가입 유형 선택</label>
              <div className="radio-group">
                <label><input type="radio" name="type" value="일반" onChange={handleChange}/> 일반 가입</label>
                <label><input type="radio" name="type" value="멘토" onChange={handleChange}/> 멘토 가입</label>
              </div>
            </div>

            {/* 이름 */}
            <div className="section">
              <label className="section-title">이름</label>
              <input type="text" name="name" placeholder="이름 입력" onChange={handleChange} />
            </div>

            {/* 생년월일 */}
            <div className="section">
              <label className="section-title">생년월일</label>
              <input type="text" name="birth" placeholder="생년월일 입력 (예시 20250916)" onChange={handleChange} />
            </div>

            {/* 성별 */}
            <div className="section">
              <label className="section-title">성별</label>
              <div className="gender-buttons">
                <button 
                  type="button"
                  className={`gender-btn ${form.gender === '남자' ? 'selected' : ''}`}
                  onClick={() => handleChange({ target: { name: 'gender', value: '남자', type: 'button' }})}
                >
                  남자
                </button>
                <button 
                  type="button"
                  className={`gender-btn ${form.gender === '여자' ? 'selected' : ''}`}
                  onClick={() => handleChange({ target: { name: 'gender', value: '여자', type: 'button' }})}
                >
                  여자
                </button>
              </div>
            </div>
          </>
        )}

        {/* 기업 회원 폼 */}
        {accountType === "company" && (
          <>
            {/* 회사명 */}
            <div className="section">
              <label className="section-title">회사명</label>
              <input type="text" name="companyName" placeholder="회사명 입력" onChange={handleChange} />
            </div>

            {/* 사업자등록번호 */}
            <div className="section">
              <label className="section-title">사업자등록번호</label>
              <input type="text" name="businessNumber" placeholder="사업자등록번호 입력 (예: 123-45-67890)" onChange={handleChange} />
            </div>

            {/* 인사 담당자 이름 */}
            <div className="section">
              <label className="section-title">인사 담당자 이름</label>
              <input type="text" name="hrName" placeholder="담당자 이름 입력" onChange={handleChange} />
            </div>

            {/* 인사 담당자 연락처 */}
            <div className="section">
              <label className="section-title">인사 담당자 연락처</label>
              <input type="text" name="hrPhone" placeholder="연락처 입력 (예: 010-1234-5678)" onChange={handleChange} />
            </div>

            {/* 인사 담당자 이메일 */}
            <div className="section">
              <label className="section-title">인사 담당자 이메일</label>
              <input type="email" name="hrEmail" placeholder="담당자 이메일 입력" onChange={handleChange} />
            </div>
          </>
        )}

        {/* 공통 필드: 이메일, 비밀번호 */}
        <div className="section">
          <label className="section-title">이메일</label>
          <input type="email" name="email" placeholder="이메일 입력" onChange={handleChange} />
        </div>

        <div className="section">
          <label className="section-title">비밀번호</label>
          <div className="password-input-wrapper">
            <input 
              type={showPassword ? "text" : "password"} 
              name="password" 
              placeholder="비밀번호 입력" 
              onChange={handleChange} 
            />
            <button 
              type="button" 
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="비밀번호 보기"
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3l18 18M10.584 10.587a2 2 0 002.828 2.828" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M9.363 5.365A9.466 9.466 0 0112 5c4.97 0 8.5 4 9.5 7-.315.945-.783 1.861-1.386 2.711M17 17c-1.5 1.333-3.667 2-6 2-5 0-8.5-4-9.5-7 .528-1.577 1.5-3.111 2.889-4.389" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5C7.03 5 3.5 9 2.5 12c1 3 4.53 7 9.5 7s8.5-4 9.5-7c-1-3-4.53-7-9.5-7z" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* 약관 */}
        <div className="consent-box">
          <div className="consent-header">
            <label className="consent-all">
              <input type="checkbox" name="agreeAll" checked={form.agreeAll} onChange={handleChange}/>
              <span>필수동의 항목 및 개인정보 수집 및 이용 동의(선택), 광고성 정보 수신 (선택)에 모두 동의합니다.</span>
            </label>
          </div>
          
          <div className="consent-divider"></div>
          
          <div className="consent-items">
            <label className="consent-item">
              <input type="checkbox" name="agree14" checked={form.agree14} onChange={handleChange}/>
              <span><span className="required">[필수]</span> 만 15세 이상입니다</span>
            </label>
            
            <label className="consent-item">
              <input type="checkbox" name="agreeTerms" checked={form.agreeTerms} onChange={handleChange}/>
              <span><span className="required">[필수]</span> 이용약관 동의</span>
              <button type="button" className="expand-btn">내용보기 ∨</button>
            </label>
            
            <label className="consent-item">
              <input type="checkbox" name="agreePrivacy" checked={form.agreePrivacy} onChange={handleChange}/>
              <span><span className="required">[필수]</span> 개인정보 수집 및 이용 동의</span>
              <button type="button" className="expand-btn">내용보기 ∨</button>
            </label>
            
            <label className="consent-item">
              <input type="checkbox" name="agreeMarketing" checked={form.agreeMarketing} onChange={handleChange}/>
              <span><span className="optional">[선택]</span> 광고성 정보 수신 동의</span>
              <button type="button" className="expand-btn">내용보기 ∨</button>
            </label>
          </div>
        </div>

        <button className="submit-btn" type="submit">가입하기</button>
        
        <div className="login-link">
          <Link to="/login">이미 계정이 있으신가요? 로그인</Link>
        </div>
      </form>
      </div>
    </>
  );
}