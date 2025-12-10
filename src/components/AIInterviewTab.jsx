import React, { useState } from 'react';

const AIInterviewTab = () => {
  const [feedback, setFeedback] = useState('');

  const handleFeedbackRequest = () => {
    // TODO: Implement AI feedback logic
    setFeedback('피드백이 곧 구현될 예정입니다.');
  };

  return (
    <div className="ai-tab">
      <h2>AI 면접 연습</h2>
      <p>면접 질문에 대한 답변을 입력해보세요. AI가 피드백을 제공합니다.</p>
      <textarea
        className="ai-input"
        placeholder="면접 답변을 입력하세요..."
      ></textarea>
      <button className="primary-btn" onClick={handleFeedbackRequest}>피드백 받기</button>
      {feedback && (
        <div className="feedback-result">
          <h3>AI 피드백:</h3>
          <p>{feedback}</p>
        </div>
      )}
    </div>
  );
};

export default AIInterviewTab;