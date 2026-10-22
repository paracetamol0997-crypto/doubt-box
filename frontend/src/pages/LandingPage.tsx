import React from 'react';
import {
  GraduationCap,
  Briefcase,
  Shield,
  Zap,
  ArrowRight,
  MessageCircleQuestion,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  Layers
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 pt-16 pb-20 sm:pt-24 sm:pb-32 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-100/70 text-indigo-700 text-xs font-semibold mb-6 border border-indigo-200/60 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ask Freely. Learn Confidently.</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-950 tracking-tight leading-[1.15]">
              Every Question Deserves an <span className="text-indigo-600 underline decoration-indigo-200 decoration-wavy underline-offset-8">Answer</span>.
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Many bright students hesitate to ask questions in crowded lecture halls out of fear or hesitation.
              <strong className="text-slate-800 font-semibold"> Doubt Box</strong> gives college students a safe, direct channel to submit academic doubts, while professors answer and resolve them with precision.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('/student/register')}
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <GraduationCap className="w-5 h-5" />
                <span>Get Started as Student</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('/teacher/register')}
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <span>Join as Teacher</span>
              </button>
            </div>

            {/* Micro proof badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant Real-time Alerts
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-indigo-500" /> Student Confidentiality
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-amber-500" /> Verified Faculty Approvals
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works in 3 Steps */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600">Simple 3-Step Process</h2>
            <p className="mt-2 text-3xl font-bold text-slate-900 tracking-tight">How Doubt Box Works</p>
            <p className="mt-3 text-slate-500 text-sm">
              From classroom confusion to crystal-clear understanding in three seamless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-200 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold text-lg mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Student Submits Doubt</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Choose the subject, describe what concept is unclear, set priority, and submit privately without classroom peer pressure.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-200 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold text-lg mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Faculty Receives Real-time Alert</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                The authorized professor gets an instant WebSocket notification on their dashboard, organized by subject and urgency.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-slate-50/70 border border-slate-200/80 hover:border-indigo-200 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold text-lg mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Detailed Answer & Resolution</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                The teacher reviews the doubt, requests clarification if needed, and publishes an explanation that updates the student’s dashboard immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Value Section (Students vs Teachers) */}
      <section className="py-20 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* For Students */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold">
                <GraduationCap className="w-4 h-4" /> For College Students
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Never let a doubt hold back your academic potential</h3>
              <ul className="space-y-3.5 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Zero Judgment:</strong> Submit questions without feeling nervous, shy, or intimidated by peers.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Persistent Doubt Vault:</strong> Review all answered doubts and explanations before midterms and finals.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <span><strong>Instant Notifications:</strong> See when your professor answers or requests further clarification.</span>
                </li>
              </ul>
              <button
                onClick={() => onNavigate('/student/register')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Create Free Student Account &rarr;
              </button>
            </div>

            {/* For Teachers */}
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 text-violet-700 rounded-lg text-xs font-semibold">
                <Briefcase className="w-4 h-4" /> For Faculty & Professors
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Measure student comprehension beyond the lecture hall</h3>
              <ul className="space-y-3.5 text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                  <span><strong>Targeted Subject Inboxes:</strong> Only receive questions matching your assigned courses and departments.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                  <span><strong>Real-time Push Alerts:</strong> Stay connected with urgent queries via WebSockets.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-violet-600 shrink-0 mt-0.5" />
                  <span><strong>Institutional Audit Trail:</strong> Track resolution history, status updates, and teaching impact metrics.</span>
                </li>
              </ul>
              <button
                onClick={() => onNavigate('/teacher/register')}
                className="text-xs font-semibold text-violet-600 hover:text-violet-800 flex items-center gap-1"
              >
                Register as Faculty Member &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Security and Privacy Section */}
      <section id="privacy" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Shield className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Institutional Privacy & Security</h2>
            <p className="mt-3 text-slate-500 text-sm">
              Engineered with enterprise security standards for collegiate institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <Lock className="w-6 h-6 text-indigo-600 mb-3" />
              <h4 className="font-semibold text-slate-900 text-sm mb-1">Role Isolation</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Students and faculty portals are strictly separated. Students cannot access teacher APIs or read peer doubts.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <Shield className="w-6 h-6 text-emerald-600 mb-3" />
              <h4 className="font-semibold text-slate-900 text-sm mb-1">Faculty Verification</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Public teacher registrations are held in pending status until officially verified by college administrators.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <Layers className="w-6 h-6 text-amber-600 mb-3" />
              <h4 className="font-semibold text-slate-900 text-sm mb-1">Full Data Persistence</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Questions and answers are stored in a relational database with audit trails, never lost on tab or browser close.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <Zap className="w-6 h-6 text-purple-600 mb-3" />
              <h4 className="font-semibold text-slate-900 text-sm mb-1">Authenticated WebSockets</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Real-time notification events are cryptographically authenticated and routed solely to authorized channel groups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-slate-950 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to bridge the classroom confidence gap?</h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Join Doubt Box today and create a responsive, inclusive learning atmosphere.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('/student/register')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-sm transition-colors"
            >
              Student Sign Up
            </button>
            <button
              onClick={() => onNavigate('/teacher/register')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 font-semibold text-sm transition-colors"
            >
              Teacher Registration
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
