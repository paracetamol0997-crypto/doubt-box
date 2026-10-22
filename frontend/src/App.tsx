import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { StudentLoginPage } from './pages/StudentLoginPage';
import { TeacherLoginPage } from './pages/TeacherLoginPage';
import { StudentRegisterPage } from './pages/StudentRegisterPage';
import { TeacherRegisterPage } from './pages/TeacherRegisterPage';
import { StudentDashboard } from './features/student/StudentDashboard';
import { TeacherDashboard } from './features/teacher/TeacherDashboard';
import { NotFoundPage, UnauthorizedPage } from './pages/NotFoundPage';

const AppContent: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [selectedDoubtId, setSelectedDoubtId] = useState<string | null>(null);
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectDoubtFromNotification = (doubtId: string) => {
    setSelectedDoubtId(doubtId);
    if (user?.role === 'STUDENT') {
      navigate('/student/dashboard');
    } else if (user?.role === 'TEACHER') {
      navigate('/teacher/dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Connecting to Doubt Box...</p>
        </div>
      </div>
    );
  }

  // Simple route rendering
  let pageComponent: React.ReactNode = null;

  if (currentPath === '/') {
    pageComponent = <LandingPage onNavigate={navigate} />;
  } else if (currentPath === '/how-it-works') {
    pageComponent = <HowItWorksPage onNavigate={navigate} />;
  } else if (currentPath === '/student/login') {
    pageComponent = <StudentLoginPage onNavigate={navigate} />;
  } else if (currentPath === '/teacher/login') {
    pageComponent = <TeacherLoginPage onNavigate={navigate} />;
  } else if (currentPath === '/student/register') {
    pageComponent = <StudentRegisterPage onNavigate={navigate} />;
  } else if (currentPath === '/teacher/register') {
    pageComponent = <TeacherRegisterPage onNavigate={navigate} />;
  } else if (currentPath === '/student/dashboard' || currentPath.startsWith('/student/doubts')) {
    if (!user) {
      pageComponent = <StudentLoginPage onNavigate={navigate} />;
    } else if (user.role !== 'STUDENT') {
      pageComponent = <UnauthorizedPage onNavigate={navigate} />;
    } else {
      pageComponent = <StudentDashboard initialDoubtId={selectedDoubtId} />;
    }
  } else if (currentPath === '/teacher/dashboard' || currentPath.startsWith('/teacher/inbox')) {
    if (!user) {
      pageComponent = <TeacherLoginPage onNavigate={navigate} />;
    } else if (user.role !== 'TEACHER' && user.role !== 'ADMIN') {
      pageComponent = <UnauthorizedPage onNavigate={navigate} />;
    } else {
      pageComponent = <TeacherDashboard initialDoubtId={selectedDoubtId} />;
    }
  } else if (currentPath === '/unauthorized') {
    pageComponent = <UnauthorizedPage onNavigate={navigate} />;
  } else {
    pageComponent = <NotFoundPage onNavigate={navigate} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        onSelectDoubt={handleSelectDoubtFromNotification}
      />
      <main className="flex-1">{pageComponent}</main>
      <Footer onNavigate={navigate} />
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
