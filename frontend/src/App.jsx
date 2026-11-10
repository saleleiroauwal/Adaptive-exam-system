import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ExamInstructions from './pages/student/ExamInstructions';
import ActiveExamInterface from './pages/student/ActiveExamInterface';
import ExamResultView from './pages/student/ExamResultView';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import QuestionBankManager from './pages/admin/QuestionBankManager';
import StudentAnalytics from './pages/admin/StudentAnalytics';

function AppContent() {
  const { user, isAdmin } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  // Navigation state
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedExam, setSelectedExam] = useState(null);
  const [activeSessionData, setActiveSessionData] = useState(null);
  const [targetSessionId, setTargetSessionId] = useState(null);
  const [adminTargetExamId, setAdminTargetExamId] = useState(null);

  // If not logged in, render Auth pages
  if (!user) {
    if (authMode === 'register') {
      return <Register onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <Login onSwitchToRegister={() => setAuthMode('register')} />;
  }

  // --- Student Navigation Handlers ---
  const handleSelectExamForInstructions = (exam) => {
    setSelectedExam(exam);
    setCurrentView('instructions');
  };

  const handleStartExamSession = (sessionData) => {
    setActiveSessionData(sessionData);
    setCurrentView('active_exam');
  };

  const handleExamCompleted = (sessionId) => {
    setTargetSessionId(sessionId);
    setCurrentView('result');
  };

  const handleViewResultDirect = (sessionId) => {
    setTargetSessionId(sessionId);
    setCurrentView('result');
  };

  // --- Admin Navigation Handlers ---
  const handleNavigateToQuestions = (examId) => {
    setAdminTargetExamId(examId);
    setCurrentView('question_bank');
  };

  const handleNavigateToAnalytics = (examId) => {
    setAdminTargetExamId(examId);
    setCurrentView('analytics');
  };

  return (
    <div className="app-container">
      {/* If taking an active exam, show minimal/no distraction navbar */}
      {currentView !== 'active_exam' && (
        <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      )}

      <main className="main-content">
        {isAdmin ? (
          // ADMIN VIEWS
          <>
            {currentView === 'dashboard' && (
              <AdminDashboard
                onNavigateToQuestions={handleNavigateToQuestions}
                onNavigateToAnalytics={handleNavigateToAnalytics}
              />
            )}
            {currentView === 'question_bank' && (
              <QuestionBankManager
                initialExamId={adminTargetExamId}
                onBack={() => setCurrentView('dashboard')}
              />
            )}
            {currentView === 'analytics' && (
              <StudentAnalytics
                initialExamId={adminTargetExamId}
                onBack={() => setCurrentView('dashboard')}
              />
            )}
          </>
        ) : (
          // STUDENT VIEWS
          <>
            {(currentView === 'dashboard' || currentView === 'my_results') && (
              <StudentDashboard
                onSelectExam={handleSelectExamForInstructions}
                onViewResult={handleViewResultDirect}
              />
            )}

            {currentView === 'instructions' && selectedExam && (
              <ExamInstructions
                exam={selectedExam}
                onBack={() => setCurrentView('dashboard')}
                onStartExam={handleStartExamSession}
              />
            )}

            {currentView === 'active_exam' && activeSessionData && (
              <ActiveExamInterface
                initialSessionData={activeSessionData}
                onExamCompleted={handleExamCompleted}
              />
            )}

            {currentView === 'result' && targetSessionId && (
              <ExamResultView
                sessionId={targetSessionId}
                onBackToDashboard={() => setCurrentView('dashboard')}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
