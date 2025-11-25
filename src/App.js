import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Header from "./Header";
import Home from "./Home"; // 새로운 홈 페이지
import LoginForm from "./LoginForm";
import Signup from "./Signup.jsx";
import AIInterview from "./AIInterview";
import Mentoring from "./Mentoring";
import MentoringChat from "./MentoringChat";
import Headhunting from "./Headhunting.jsx";
import Profile from "./Profile.jsx";
import Spec from "./Spec.jsx";

function AppContent() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="bg-body text-main">
      {!isLoginPage && <Header />}
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ai-interview" element={<AIInterview />} />
          <Route path="/mentoring" element={<Mentoring />} />
          <Route path="/mentoring-chat" element={<MentoringChat />} />
          <Route path="/headhunting" element={<Headhunting />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/spec" element={<Spec />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<Signup />} />
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