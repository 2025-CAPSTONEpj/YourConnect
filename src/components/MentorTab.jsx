import React from 'react';
import mentors from './Mentors';

const MentorTab = () => {
  return (
    <div className="app-container">
      <main className="tab-container">
        <div className="mentor-tab">
          <h2>멘토 찾기</h2>
          <div className="mentor-list">
            {mentors.map((mentor, index) => (
              <div key={index} className="mentor-card">
                <img src={mentor.image} alt={mentor.name} className="mentor-img" />
                <div className="mentor-info">
                  <h3>{mentor.name}</h3>
                  <p className="mentor-title">{mentor.title}</p>
                  <p className="mentor-desc">{mentor.description}</p>
                  <button className="mentor-btn">멘토 요청</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MentorTab;