import React from 'react';
import { Logo } from './Logo';
import { ShieldCheck, Heart, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('/')}>
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                ?
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Doubt<span className="text-indigo-400">Box</span>
              </span>
            </div>
            <p className="text-slate-400 max-w-sm leading-relaxed">
              Doubt Box creates a judgment-free digital corridor for students to ask academic doubts freely, and enables faculty members to provide thoughtful, timely guidance.
            </p>
            <div className="flex items-center gap-2 text-indigo-400 text-[11px] pt-1">
              <Lock className="w-3.5 h-3.5" />
              <span>End-to-end academic privacy & role-based authentication</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Portals</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('/student/login')} className="hover:text-white transition-colors">
                  Student Sign In
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/student/register')} className="hover:text-white transition-colors">
                  Student Registration
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/teacher/login')} className="hover:text-white transition-colors">
                  Faculty Sign In
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/teacher/register')} className="hover:text-white transition-colors">
                  Faculty Registration
                </button>
              </li>
            </ul>
          </div>

          {/* College Trust & Policy */}
          <div>
            <h4 className="text-white font-semibold mb-3 uppercase tracking-wider text-[11px]">Institution & Safety</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('/how-it-works')} className="hover:text-white transition-colors">
                  How Doubt Box Works
                </button>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Faculty Approvals</span>
              </li>
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">
                  Student Privacy Policy
                </a>
              </li>
              <li>
                <a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                  Django Admin Panel &rarr;
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Doubt Box Edu. Engineered for College Excellence.</p>
          <p className="flex items-center gap-1">
            Ask Freely. Learn Confidently.
          </p>
        </div>
      </div>
    </footer>
  );
};
