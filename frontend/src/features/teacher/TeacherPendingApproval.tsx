import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { ShieldAlert, RefreshCw, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export const TeacherPendingApproval: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { success, error, info } = useToast();
  const [checking, setChecking] = useState(false);
  const [approving, setApproving] = useState(false);

  const handleRefresh = async () => {
    setChecking(true);
    try {
      await refreshUser();
      info('Status Checked', 'Profile refreshed from server.');
    } catch {
      error('Failed to refresh status.');
    } finally {
      setChecking(false);
    }
  };

  // Demo helper: allows evaluating admin approval directly or explains admin panel
  const handleQuickDemoApprove = async () => {
    setApproving(true);
    try {
      // Find teacher in admin list and approve
      const adminTeachers = await api.getAdminTeachers('pending');
      const currentTeacher = adminTeachers.find((t) => t.email === user?.email);
      if (currentTeacher) {
        await api.takeTeacherAction(currentTeacher.id, 'approve');
        await refreshUser();
        success('Faculty Account Approved', 'Your account has been activated with full teacher permissions!');
      } else {
        await refreshUser();
      }
    } catch (err: any) {
      error('Approval Action', 'Please use Django Admin (http://127.0.0.1:8000/admin/) with admin credentials.');
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-inner">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Faculty Registration Pending Approval</h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
          Welcome, <strong className="text-slate-800">{user?.full_name}</strong>. In accordance with institutional security policies, newly registered faculty members cannot access student doubts until vetted by an administrator.
        </p>
      </div>

      {/* Profile Details card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 text-left max-w-md mx-auto space-y-2 text-xs shadow-xs">
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500 font-medium">Faculty Name</span>
          <span className="font-semibold text-slate-900">{user?.full_name}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500 font-medium">Email Address</span>
          <span className="font-mono text-slate-900">{user?.email}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500 font-medium">Faculty Employee ID</span>
          <span className="font-mono text-slate-900">{user?.teacher_profile?.employee_id || 'Pending'}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-slate-100">
          <span className="text-slate-500 font-medium">Department</span>
          <span className="font-semibold text-slate-900">{user?.teacher_profile?.department}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-slate-500 font-medium">Current Status</span>
          <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            Pending Institutional Verification
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={handleRefresh}
          disabled={checking}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          {checking ? 'Checking Status...' : 'Check Approval Status'}
        </button>

        <a
          href="http://127.0.0.1:8000/admin/accounts/teacherprofile/"
          target="_blank"
          rel="noreferrer"
          className="px-5 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
        >
          <span>Open Django Admin Approval</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
