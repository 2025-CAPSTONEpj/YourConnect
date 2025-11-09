import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./Header";
import MiniProfile from "./MiniProfile";
import MentorTab from "./components/MentorTab";
import LoginForm from "./LoginForm";
import Mentoring from "./Mentoring";
import MentoringChat from "./MentoringChat";
import Headhunting from "./Headhunting";
import AIInterview from "./AIInterview";

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const basename = process.env.PUBLIC_URL;

  return (
    <div className="bg-body text-main">
      {/* 로그인 페이지가 아닐 때만 헤더 표시 */}
      {!isLoginPage && <Header />}
      
      <main>
        <Routes>
          <Route path="/" element={<MiniProfile />} />
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
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;