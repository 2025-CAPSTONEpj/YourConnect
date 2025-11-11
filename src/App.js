import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./Header";
import Home from "./Home"; // 새로운 홈 페이지
import MiniProfile from "./MiniProfile";
import LoginForm from "./LoginForm";
import AIInterview from "./AIInterview";
import Mentoring from "./Mentoring";
import MentoringChat from "./MentoringChat";
import Headhunting from "./Headhunting";

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className="bg-body text-main">
      {/* 로그인 페이지가 아닐 때만 헤더 표시 */}
      {!isLoginPage && <Header />}
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<MiniProfile />} />
          <Route path="/miniprofile" element={<MiniProfile />} />
          <Route path="/ai-interview" element={<AIInterview />} />
          <Route path="/mentoring" element={<Mentoring />} />
          <Route path="/mentoring-chat" element={<MentoringChat />} />
          <Route path="/headhunting" element={<Headhunting />} />
          <Route path="/login" element={<LoginForm />} />
        </Routes>
      </main>
      
      {!isLoginPage && <footer>{/* 푸터 영역 */}</footer>}
    </div>
  );
}

function App() {
  return (
    <Router basename="/YC">
      <AppContent />
    </Router>
  );
}

export default App;