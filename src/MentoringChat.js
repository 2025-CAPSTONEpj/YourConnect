import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './MentoringChat.css';

function MentoringChat() {
  const [activeHistory, setActiveHistory] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const historyData = [
    {
      id: 1,
      title: "멘토 1",
      subtitle: "질문 1회권",
      question: "멘토님 안녕하세요. 자기소개서는 어떻게 써야 할까요?",
      answer: "좋은 질문이에요! 자기소개서는 본인의 성장 과정과 목표를 중심으로 스토리텔링하듯 쓰면 좋아요."
    },
    {
      id: 2,
      title: "멘토 2",
      subtitle: "질문 3회권",
      question: "면접 때 자주 묻는 질문이 있을까요?",
      answer: "최근에는 프로젝트 경험 중심의 질문이 많아요. 구체적인 사례를 준비해두세요."
    },
    {
      id: 3,
      title: "멘토 3",
      subtitle: "질문 5회권",
      question: "데이터 분석 직무에는 어떤 역량이 중요할까요?",
      answer: "SQL, Python, 커뮤니케이션 능력이 매우 중요합니다. 특히 문제 정의 능력을 키워보세요."
    }
  ];

  const handleHistoryClick = (item) => {
    if (activeHistory === item.id) {
      // 동일 박스 재클릭 시 초기화
      setActiveHistory(null);
      setMessages([]);
    } else {
      // 신규 활성화
      setActiveHistory(item.id);
      setMessages([
        { type: 'question', text: item.question },
        { type: 'answer', text: item.answer }
      ]);
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setMessages([...messages, { type: 'question', text: inputMessage }]);
      setInputMessage('');
      
      // 간단한 자동 응답 (실제로는 API 호출)
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: 'answer', 
          text: '답변이 도착했습니다. 추가 질문이 있으시면 말씀해주세요!' 
        }]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="mentoring-chat-container">
      <main className="chat-main">
        {/* 왼쪽 사이드 */}
        <aside className="chat-sidebar">
          <div className="profile-box">
            <img 
              className="profile-img" 
              src="https://www.gravatar.com/avatar/?d=mp&s=100" 
              alt="기본 프로필 이미지"
            />
            <div className="profile-info">
              <h3>이가윤님</h3>
              <Link to="/profile" className="profile-edit">
                <span>⚙️</span>
                <span>회원정보 수정</span>
              </Link>
            </div>
          </div>

          <div className="membership">
            <p><b>연간 멤버십</b></p>
          </div>

          <h4>나의 질문 기록</h4>
          <div className="history-box">
            {historyData.map(item => (
              <div 
                key={item.id}
                className={`history-item ${activeHistory === item.id ? 'active' : ''}`}
                onClick={() => handleHistoryClick(item)}
              >
                {item.title}<br />
                <small>{item.subtitle}</small>
              </div>
            ))}
          </div>
        </aside>

        {/* 오른쪽 대화 영역 */}
        <section className="chat-area">
          <div className="chat-header">
            <img 
              src="https://www.gravatar.com/avatar/?d=mp&s=100" 
              alt="기본 프로필 이미지"
            />
            <div>
              <h2>이서준</h2>
            </div>
          </div>

          <div className="chat-content">
            <div className="message-box">
              {messages.length === 0 ? (
                <p style={{textAlign: 'center', color: '#999', marginTop: '50px'}}>
                  왼쪽에서 질문 기록을 선택하거나 새로운 질문을 입력하세요.
                </p>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={msg.type}>
                    <strong>{msg.type === 'question' ? 'Q. ' : 'A. '}</strong>
                    {msg.text}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="chat-input">
            <input 
              type="text" 
              placeholder="질문을 입력하세요..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button onClick={handleSendMessage}>📩</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default MentoringChat;