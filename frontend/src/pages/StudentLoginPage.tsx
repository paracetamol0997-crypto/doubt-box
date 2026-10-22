import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { GraduationCap, Mail, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface StudentLoginPageProps {
  onNavigate: (path: string) => void;
}

export const StudentLoginPage: React.FC<StudentLoginPageProps> = ({ onNavigate }) => {
  const { loginStudent } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await loginStudent(email.trim(), password);
      success('Login Successful', `Welcome back, ${user.full_name}!`);
      onNavigate('/student/dashboard');
    } catch (err: any) {
      const msg = err.message || 'Login failed. Please check your credentials.';
      setErrorMessage(msg);
      error('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('alex.chen@doubtbox.edu');
    setPassword('Student@12345');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50">
        <div className="text-center">
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto text-indigo-600 mb-4 shadow-inner">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Student Portal Login</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your academic doubts, answers, and professor guidance.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">College Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@doubtbox.edu"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In as Student'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Credentials Quick Fill */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-center">
          <p className="text-[11px] text-slate-500 font-medium">Quick Evaluation Demo Account:</p>
          <button
            type="button"
            onClick={handleFillDemo}
            className="mt-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 mx-auto"
          >
            <Sparkles className="w-3 h-3" /> Auto-fill Demo Student (Alex Chen)
          </button>
        </div>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have a student account?{' '}
            <button
              onClick={() => onNavigate('/student/register')}
              className="font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Register here
            </button>
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Are you a faculty member?{' '}
            <button
              onClick={() => onNavigate('/teacher/login')}
              className="text-slate-600 hover:underline"
            >
              Teacher Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
