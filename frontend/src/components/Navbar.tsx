import React, { useState } from 'react';
import { Logo } from './Logo';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import {
  LogOut,
  User as UserIcon,
  Menu,
  X,
  GraduationCap,
  Briefcase,
  HelpCircle,
  LayoutDashboard
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onSelectDoubt?: (doubtId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate, onSelectDoubt }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    onNavigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="cursor-pointer" onClick={() => onNavigate('/')}>
            <Logo size="md" showTagline={false} />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('/')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentPath === '/' ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('/how-it-works')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentPath === '/how-it-works' ? 'text-indigo-600 bg-indigo-50/70' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              How It Works
            </button>

            {user && (
              <button
                onClick={() => onNavigate(user.role === 'STUDENT' ? '/student/dashboard' : '/teacher/dashboard')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  currentPath.includes('dashboard') || currentPath.includes('doubts')
                    ? 'text-indigo-600 bg-indigo-50/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            )}
          </nav>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Real-time Notifications */}
                <NotificationDropdown onSelectDoubt={onSelectDoubt} />

                {/* User profile pill */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-slate-800 truncate max-w-[120px]">{user.full_name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role.toLowerCase()}</p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('/student/login')}
                  className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Student Portal
                </button>
                <button
                  onClick={() => onNavigate('/teacher/login')}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Teacher Portal
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            {user && <NotificationDropdown onSelectDoubt={onSelectDoubt} />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => {
              onNavigate('/');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('/how-it-works');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            How It Works
          </button>

          {user ? (
            <>
              <button
                onClick={() => {
                  onNavigate(user.role === 'STUDENT' ? '/student/dashboard' : '/teacher/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-indigo-600 bg-indigo-50/50"
              >
                Dashboard
              </button>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-3">
                <span className="text-xs text-slate-500 font-medium">{user.full_name} ({user.role})</span>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-rose-600 font-medium flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <button
                onClick={() => {
                  onNavigate('/student/login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-xs font-semibold text-white bg-indigo-600 rounded-xl"
              >
                Student Portal
              </button>
              <button
                onClick={() => {
                  onNavigate('/teacher/login');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-xs font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                Teacher Portal
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
