import React from 'react';

const ProfileTab = () => {
  return (
    <div className="profile-tab">
      <h2>내 프로필</h2>
      <div className="profile-card">
        <img
          src="https://randomuser.me/api/portraits/men/10.jpg"
          alt="profile"
        />
        <div>
          <h3>홍길동</h3>
          <p>직무: UX 디자이너</p>
          <p>관심 분야: 커리어 성장, 포트폴리오 전략</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileTab;