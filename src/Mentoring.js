import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Mentoring.css';

function Mentoring() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState('');
  const [isAccepted, setIsAccepted] = useState(false);

  const mentors = [
    { name: "이서준", field: "IT / 백엔드 개발자", rating: 4.9, ratingCount: 128 },
    { name: "박현수", field: "금융 / 전략 기획", rating: 4.7, ratingCount: 96 },
    { name: "배현진", field: "경영 컨설턴트 / PM", rating: 4.8, ratingCount: 142 },
    { name: "서유진", field: "인사 / 커리어 코치", rating: 4.6, ratingCount: 75 },
    { name: "최가은", field: "데이터 분석가 / PM", rating: 4.8, ratingCount: 101 },
    { name: "정재윤", field: "AI 개발자 / 연구원", rating: 4.9, ratingCount: 187 }
  ];

  const handleApply = (mentorName) => {
    setSelectedMentor(mentorName);
    setIsAccepted(false);
    setShowModal(true);

    setTimeout(() => {
      setIsAccepted(true);
    }, 3000);
  };

  const handleChat = () => {
    navigate('/mentoring-chat');
  };

  return (
    <div className="mentoring-page">
      <main className="mentoring-main">
        <section className="mentor-grid">
          {mentors.map((mentor, index) => (
            <div key={index} className="mentor-card">
              <div className="mentor-left">
                <img 
                  src="https://cdn-icons-png.flaticon.com/512/1946/1946429.png" 
                  alt="멘토 프로필"
                />
                <div className="rating-row" aria-label={`평점 ${mentor.rating.toFixed(1)}점, 총 ${mentor.ratingCount}명 평가`}>
                  <span className="rating-label">평점</span>
                  <span className="mentor-star" aria-hidden="true">★</span>
                  <span className="rating">{mentor.rating.toFixed(1)}</span>
                  <span className="rating-count">({mentor.ratingCount})</span>
                </div>
                <div className="mentor-info">
                  <h3>{mentor.name}</h3>
                  <p>전문 분야: {mentor.field}</p>
                </div>
              </div>
              <div className="mentor-btns">
                <button className="mentor-detail-btn">상세 정보</button>
                <button className="mentor-apply-btn" onClick={() => handleApply(mentor.name)}>
                  멘토링 신청
                </button>
              </div>
            </div>
          ))}
        </section>

        <aside className="mentoring-aside">
          <h4>이가윤님 👩🏻‍💻</h4>
          <p onClick={() => navigate('/profile')} style={{ cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = '#9333EA'} onMouseLeave={(e) => e.target.style.color = 'inherit'}>회원정보 수정</p>
          <hr />
          <h4>분야 선택</h4>
          <p>개발자 / PM / 디자이너</p>
          <hr />
          <h4>멘토링 진행 상태</h4>
          <p>요청 대기 / 수락됨</p>
        </aside>
      </main>

      {/* 모달 */}
      {showModal && (
        <div className="mentoring-modal" onClick={() => setShowModal(false)}>
          <div className="mentoring-modal-content" onClick={(e) => e.stopPropagation()}>
            {!isAccepted ? (
              <>
                <h2>멘토링 요청 대기 중...</h2>
                <p>{selectedMentor}님께 멘토링을 요청했습니다.</p>
              </>
            ) : (
              <>
                <h2 style={{color: '#00a36c'}}>수락 완료</h2>
                <p>{selectedMentor}님이 멘토 요청을 수락하였습니다.</p>
                <button onClick={handleChat}>대화하기</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Mentoring;