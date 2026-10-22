import React from 'react';
import {
  MessageSquare,
  BellRing,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  Briefcase
} from 'lucide-react';

interface HowItWorksPageProps {
  onNavigate: (path: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How Doubt Box Works
        </h1>
        <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
          A transparent look at how questions are safely delivered from a student's screen directly to the authorized faculty member.
        </p>
      </div>

      <div className="space-y-12">
        {/* Step 1 */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <MessageSquare className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Phase 01</span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">Submit Academic Doubts with Complete Privacy</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Students select their course code (e.g. CS201 Data Structures), formulate their question with an optional priority level, and submit. The question is safely indexed with an immutable timestamp and a unique tracking ID (e.g., DBT-2026-XXXX).
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 shrink-0">
            <BellRing className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-600">Phase 02</span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">Real-time Faculty Routing via Channels</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              The Doubt Box backend queries approved teachers allocated to that specific subject or department. An instantaneous WebSocket broadcast is emitted to the teacher's active dashboard, immediately surfacing an in-app alert without requiring page refreshes.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Phase 03</span>
            <h3 className="text-xl font-bold text-slate-900 mt-1">Thoughtful Answers & Student Notification</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              The professor reviews the context, submits a rich answer or requests clarification, and updates the doubt status to "Answered". The student receives a real-time notification alert and can review the professor's explanation permanently.
            </p>
          </div>
        </div>
      </div>

      {/* Action banner */}
      <div className="mt-16 p-8 rounded-3xl bg-indigo-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold">Ready to get started?</h3>
          <p className="text-xs text-indigo-200 mt-1">Choose your portal and experience Doubt Box today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('/student/register')}
            className="px-4 py-2.5 rounded-xl bg-white text-indigo-900 font-semibold text-xs hover:bg-indigo-50 transition-colors"
          >
            Student Register
          </button>
          <button
            onClick={() => onNavigate('/teacher/register')}
            className="px-4 py-2.5 rounded-xl bg-indigo-800 text-white border border-indigo-700 font-semibold text-xs hover:bg-indigo-700 transition-colors"
          >
            Faculty Register
          </button>
        </div>
      </div>
    </div>
  );
};
