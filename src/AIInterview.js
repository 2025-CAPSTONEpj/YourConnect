import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AIInterview.css';

function AIInterview() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: '이가윤' });
  const [questions] = useState([
    "자기소개를 해보세요.",
    "최근에 해결한 어려운 문제와 접근 방식을 설명해 주세요.",
    "5년 뒤 본인의 커리어를 어떻게 그리고 있나요?",
    "자바스크립트로 성능 문제를 어떻게 대처하나요?"
  ]);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [submittedQuestions, setSubmittedQuestions] = useState([]);
  const [favoriteQuestions, setFavoriteQuestions] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isGenerated, setIsGenerated] = useState(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('access_token');
      setIsLoggedIn(!!token);
    };

    checkLoginStatus();

    const savedUserInfo = localStorage.getItem('userInfo');
    if (savedUserInfo) {
      try {
        const parsed = JSON.parse(savedUserInfo);
        setUserInfo({ name: parsed.name || '이가윤' });
      } catch (e) {
        console.error('사용자 정보 로드 오류:', e);
      }
    }

    window.addEventListener('loginStatusChanged', checkLoginStatus);
    window.addEventListener('storage', checkLoginStatus);

    return () => {
      window.removeEventListener('loginStatusChanged', checkLoginStatus);
      window.removeEventListener('storage', checkLoginStatus);
    };
  }, []);

  const handleGenerate = () => {
    setIsGenerated(true);
    setCurrentIndex(0);
    setCurrentQuestion(questions[0]);
    setSubmittedQuestions([]);
  };

  const handleSubmit = () => {
    const q = currentQuestion;
    const a = answerInput.trim();
    
    if (!q || !a) {
      alert("답변을 작성해주세요!");
      return;
    }

    setFeedback({
      question: q,
      answer: a,
      feedbackText: '답변에 구체성이나 핵심 키워드가 부족합니다.\n경험 기반 예시를 추가해보세요.'
    });

    if (!submittedQuestions.includes(q)) {
      setSubmittedQuestions([...submittedQuestions, q]);
    }

    setAnswerInput('');
    
    if (currentIndex < questions.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentQuestion(questions[nextIndex]);
    } else {
      alert("모든 질문을 완료했습니다!");
    }
  };

  const handleReset = () => {
    setIsGenerated(false);
    setCurrentQuestion('');
    setAnswerInput('');
    setFeedback(null);
    setCurrentIndex(0);
    setSubmittedQuestions([]);
    setFavoriteQuestions([]);
  };

  const toggleFavorite = (question) => {
    if (favoriteQuestions.includes(question)) {
      setFavoriteQuestions(favoriteQuestions.filter(q => q !== question));
    } else {
      setFavoriteQuestions([...favoriteQuestions, question]);
    }
  };

  const filteredQuestions = submittedQuestions.filter(q => 
    q.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  return (
    <div className="ai-interview-wrapper">
    <div className="ai-interview-container">
      <main className="ai-main">
        {/* 왼쪽 영역 */}
        <aside className="ai-sidebar">
          {isLoggedIn ? (
            <div className="ai-profile-box logged">
              <div className="ai-profile-content">
                <img 
                  className="ai-profile-img" 
                  src="https://www.gravatar.com/avatar/?d=mp&s=100" 
                  alt="프로필 이미지"
                />
                <div className="ai-profile-info">
                  <h3 className="ai-profile-name">{userInfo.name}님</h3>
                  <Link to="/profile" className="ai-profile-edit">
                    <span>⚙️</span>
                    <span>회원정보 수정</span>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="ai-profile-box">
              <div className="ai-profile-content" onClick={() => navigate('/login')}>
                <img 
                  className="ai-user-icon" 
                  src={`${process.env.PUBLIC_URL}/user.png`} 
                  alt="사용자 아이콘"
                />
                <p className="ai-profile-text">로그인이 필요합니다.</p>
              </div>
              <div className="ai-profile-footer">
                <a href="#find-id" className="ai-footer-link">아이디 찾기</a>
                <div className="ai-divider"></div>
                <a href="#find-pw" className="ai-footer-link">비밀번호 찾기</a>
              </div>
            </div>
          )}
          
          <textarea className="memo" placeholder="메모"></textarea>

          <h3>즐겨찾기 해둔 질문</h3>
          <div className="fav-list">
            {favoriteQuestions.length === 0 ? (
              <p className="empty-message">아직 즐겨찾기 해둔 질문이 없습니다.</p>
            ) : (
              favoriteQuestions.map((q, idx) => (
                <div key={idx} className="question-item">
                  <span>{q}</span>
                  <button className="star active" onClick={() => toggleFavorite(q)}>★</button>
                </div>
              ))
            )}
          </div>

          <div className="question-list-header">
            <h3>질문 목록</h3>
            <input 
              type="text" 
              className="search-input" 
              placeholder="검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>
          <div className="question-list">
            {submittedQuestions.length === 0 ? (
              <p className="empty-message">제출된 질문이 없습니다.</p>
            ) : (
              filteredQuestions.map((q, idx) => (
                <div key={idx} className="question-item">
                  <span>{q}</span>
                  <button 
                    className={`star ${favoriteQuestions.includes(q) ? 'active' : ''}`}
                    onClick={() => toggleFavorite(q)}
                  >
                    {favoriteQuestions.includes(q) ? '★' : '☆'}
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* 중앙 영역 */}
        <div className="ai-center">
          <h2>
            AI 면접 연습
            <button className="generate-btn" onClick={handleGenerate}>질문 생성</button>
          </h2>
          <section className="question-section">
            <h3 className="section-title">추천 질문 목록</h3>
            <div className="question-list-box">
              {!isGenerated ? (
                <p>'질문 생성' 버튼을 눌러 시작하세요.</p>
              ) : (
                questions.map((q, idx) => (
                  <div 
                    key={idx}
                    className={`question-row ${idx === currentIndex ? 'active' : ''}`}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setCurrentQuestion(q);
                    }}
                  >
                    {idx + 1}. {q}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* 오른쪽 영역 */}
        <div className="ai-right">
          <h2>연습하기</h2>
          <section className="practice-section">
            <p>현재 질문: <span id="currentQuestion">{currentQuestion}</span></p>
            <textarea 
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              placeholder="답변을 작성해보세요."
            ></textarea>

            <div className="btn-group">
              <button onClick={handleSubmit}>제출 & 피드백</button>
              <button onClick={handleReset}>초기화</button>
            </div>

            <h3>피드백 히스토리</h3>
            <div className="feedback-box">
              {!feedback ? (
                <span style={{color: '#999'}}>아직 제출된 답변이 없습니다.</span>
              ) : (
                <>
                  <div>Q. {feedback.question}</div>
                  <div><strong>A. {feedback.answer}</strong></div>
                  <br />
                  <div className="feedback-text"><strong>피드백:</strong> {feedback.feedbackText}</div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
    </div>
  );
}

export default AIInterview;