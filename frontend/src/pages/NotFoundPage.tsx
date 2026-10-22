import React from 'react';
import { ShieldX, ArrowLeft, Home } from 'lucide-react';

interface UnauthorizedPageProps {
  onNavigate: (path: string) => void;
}

export const UnauthorizedPage: React.FC<UnauthorizedPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldX className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Access Restricted (403)</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          You do not have the required permissions or role authorization to access this institutional resource. Student and Faculty dashboards are strictly partitioned.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('/')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" /> Return Home
          </button>
        </div>
      </div>
    </div>
  );
};

export const NotFoundPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 text-center">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner font-extrabold text-2xl font-mono">
          404
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Page Not Found</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          The requested educational resource or page does not exist on Doubt Box.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            onClick={() => onNavigate('/')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" /> Return to Homepage
          </button>
        </div>
      </div>
    </div>
  );
};
