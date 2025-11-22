import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import MiniProfile from './MiniProfile';
import LoggedInProfile from './LoggedInProfile';
import Advertisement from './Advertisement';

function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("access_token");
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();
    
    // 로그인 상태 변경 감지
    window.addEventListener('loginStatusChanged', checkLoginStatus);
    window.addEventListener('storage', checkLoginStatus);

    return () => {
      window.removeEventListener('loginStatusChanged', checkLoginStatus);
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const mentors = [
    { 
      name: "평점", 
      rating: 4.78, 
      ratingCount: 40,
      title: "멘토 이름 : 이서준",
      field: "전문 분야 : IT/백엔드 개발자",
      image: "https://randomuser.me/api/portraits/men/1.jpg"
    },
    { 
      name: "평점", 
      rating: 4.8, 
      ratingCount: 52,
      title: "멘토명 : 박현우",
      field: "전문 분야 : 금융/전략 기획",
      image: "https://randomuser.me/api/portraits/men/2.jpg"
    },
    { 
      name: "평점", 
      rating: 4.68, 
      ratingCount: 48,
      title: "멘토명 : 배한결",
      field: "전문 분야 : 경영 컨설턴트/재무",
      image: "https://randomuser.me/api/portraits/men/3.jpg"
    },
    { 
      name: "평점", 
      rating: 4.72, 
      ratingCount: 35,
      title: "멘토명 : 정재윤",
      field: "전문 분야 : AI 개발자/연구원",
      image: "https://randomuser.me/api/portraits/men/4.jpg"
    },
    { 
      name: "평점", 
      rating: 4.82, 
      ratingCount: 61,
      title: "멘토명 : 서유진",
      field: "전문 분야 : 인사(HR)/전문 커리어 코치",
      image: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    { 
      name: "평점", 
      rating: 4.67, 
      ratingCount: 54,
      title: "멘토명 : 최가은",
      field: "전문 분야 : 데이터 분석가/PM",
      image: "https://randomuser.me/api/portraits/women/2.jpg"
    },
  ];

  const jobPostings = [
    {
      company: "유한대",
      badge: "유명기업",
      title: "보령 대기업 IT 디지털 기획 과장, 차장급 구함 (국가리언)",
      deadline: "11월 10(금) - 12/20(월)",
      tags: ["대졸이상", "통신업", "경력5년", "통신관리", "소프트웨어"],
      detail: "경력 기간 이상 · 대졸 이상 · 서울 > 송파구"
    },
    {
      company: "안마영",
      badge: "다양한그룹 외주 기업 개발자 모집 인원",
      title: "[대전/2개월/유성] 대기업 솔루션 연계 프로젝트 개발자 고급 모집",
      deadline: "9/23(월) - 10/30(월)",
      tags: ["서류전형", "면접전형", "시험면접", "인적성검사"],
      detail: "임금/복지/4대보험 경력 10년 이상 - 학력무관 - 서울 > 송파구"
    }
  ];

  const qnaList = [
    {
      category: "이력서",
      views: "3일전",
      author: "ㅇㅇㄱ 개발자님",
      title: "RN 개발자 커리어 어떻게 쌓아올까요?",
      tags: ["#react", "#native", "#진로고민", "#코딩", "#실무"]
    },
    {
      category: "이력서",
      views: "14일전",
      author: "ㅇㅇ개발자님",
      title: "iOS 개발자 코드스 플랫폼(RN) 전환 어떻게 ...",
      tags: ["#react", "#native", "#진로고민", "#코딩", "#실무"]
    },
    {
      category: "이력서",
      views: "15일전",
      author: "ㅇㅇ개발자님",
      title: "웹 프론트 앤도 도전 중인데, Firebase말고도 ...",
      tags: ["#react", "#프론트", "#javascript", "#개발자", "#실무"]
    },
    {
      category: "이력서",
      views: "3일전",
      author: "ㅇㅇ개발자님",
      title: "4학년 취준생인데 이번 플젝을 프로젝트 써도 될까요?",
      tags: ["#코딩", "#프로젝트외주"]
    }
  ];

  return (
    <>
      <div className="home-main-container">
        {/* 멘토 추천과 미니프로필 2단 레이아웃 */}
        <div className="mentor-profile-layout">
          {/* 각 분야별 멘토 추천 섹션 */}
          <section className="section-mentor-recommend">
            <div className="section-header">
              <h2>각 분야별 멘토 추천</h2>
              <button 
                className="more-btn"
                onClick={() => navigate('/mentoring')}
              >
                조건 별로 보기
              </button>
            </div>
            
            <div className="mentor-grid-home">
              {mentors.map((mentor, index) => (
                <div key={index} className="mentor-card-home">
                  <div className="mentor-header-actions">
                    <button className="detail-btn">상세 정보</button>
                    <button className="apply-btn-home">멘토링 신청</button>
                  </div>
                  <img src={mentor.image} alt={mentor.title} className="mentor-avatar" />
                  <div className="mentor-rating">
                    <span className="label">{mentor.name}</span>
                    <span className="star">⭐</span>
                    <span className="score">{mentor.rating}</span>
                    <span className="count">({mentor.ratingCount})</span>
                  </div>
                  <h3 className="mentor-name">{mentor.title}</h3>
                  <p className="mentor-field">{mentor.field}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="two-column-layout">
          <section className="section-job-postings">
            <div className="section-header">
              <h3>지금 가장 주목받는 공고에요!</h3>
              <button 
                className="more-link"
                onClick={() => navigate('/headhunting')}
              >
                맞춤형 채용 설정 &gt;
              </button>
            </div>
            
            <div className="job-list-home">
              {jobPostings.map((job, index) => (
                <div key={index} className="job-card-home">
                  <div className="job-card-top">
                    <div className="job-header">
                      <span className="company-name">{job.company}</span>
                      <span className="company-badge">{job.badge}</span>
                    </div>
                    <p className="job-deadline">{job.deadline}</p>
                  </div>
                  <h3 className="job-title">{job.title}</h3>
                  <div className="job-tags">
                    {job.tags.map((tag, idx) => (
                      <span key={idx} className="job-tag">{tag}</span>
                    ))}
                  </div>
                  <p className="job-detail">{job.detail}</p>
                  <div className="job-actions">
                    <button className="bookmark-btn">☆</button>
                    <button className="apply-btn-job">지원 공고 확인</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 인기 있는 질문 */}
          <section className="section-qna">
            <div className="section-header">
              <h3>인기 있는 질문</h3>
              <button 
                className="more-link"
                onClick={() => navigate('/community')}
              >
                더보기
              </button>
            </div>
            
            <div className="qna-list">
              {qnaList.map((qna, index) => (
                <div key={index} className="qna-card">
                  <div className="qna-header">
                    <span className="qna-category">{qna.category}</span>
                    <span className="qna-views">{qna.views}</span>
                    <span className="qna-author">{qna.author}</span>
                  </div>
                  <h3 className="qna-title">{qna.title}</h3>
                  <div className="qna-tags">
                    {qna.tags.map((tag, idx) => (
                      <span key={idx} className="qna-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      {isLoggedIn ? <LoggedInProfile /> : <MiniProfile />}
      <Advertisement />
    </>
  );
}

export default Home;