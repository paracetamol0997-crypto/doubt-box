import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';
import { wsClient } from '../../services/websocket';
import { DoubtListItem, DashboardStats, Subject, DoubtStatus } from '../../types';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton } from '../../components/SkeletonLoader';
import { TeacherPendingApproval } from './TeacherPendingApproval';
import { TeacherAnswerModal } from './TeacherAnswerModal';
import {
  Briefcase,
  Search,
  Filter,
  Clock,
  CheckCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  User as UserIcon,
  BellRing,
  Sparkles,
  Inbox
} from 'lucide-react';

interface TeacherDashboardProps {
  initialDoubtId?: string | null;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ initialDoubtId }) => {
  const { user, isApprovedTeacher } = useAuth();
  const { realtimeNotify } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [doubts, setDoubts] = useState<DoubtListItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Selected Doubt for modal
  const [activeDoubtId, setActiveDoubtId] = useState<string | null>(initialDoubtId || null);

  // If teacher is not approved yet, display pending approval screen
  if (!isApprovedTeacher && user?.role !== 'ADMIN') {
    return <TeacherPendingApproval />;
  }

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsData, doubtsData, subjectsData] = await Promise.all([
        api.getTeacherStats(),
        api.getTeacherDoubts({
          search,
          subject: selectedSubject,
          status: selectedStatus,
          priority: selectedPriority,
        }),
        api.getSubjects(user?.teacher_profile?.department),
      ]);
      setStats(statsData);
      setDoubts(doubtsData);
      setSubjects(subjectsData);
    } catch (err) {
      console.error('Failed to load teacher dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedSubject, selectedStatus, selectedPriority, user?.teacher_profile?.department]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Real-time WebSocket event listener for newly submitted student doubts!
  useEffect(() => {
    const unsubNotification = wsClient.onNotification((notif) => {
      // Whenever a new doubt notification arrives:
      if (notif.notification_type === 'NEW_DOUBT') {
        // Refresh doubts inbox & stats immediately!
        fetchDashboardData();
      }
    });

    const unsubDoubtUpdate = wsClient.onDoubtUpdate((update) => {
      // Refresh inbox automatically when a new doubt is posted in any assigned subject
      fetchDashboardData();
    });

    return () => {
      unsubNotification();
      unsubDoubtUpdate();
    };
  }, [fetchDashboardData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Faculty Hero Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-violet-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-slate-950/20">
        <div>
          <div className="flex items-center gap-2 mb-1 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Real-Time Academic Dispatch
            </span>
            <span>•</span>
            <span>{user?.teacher_profile?.department}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Faculty Inbox — Prof. {user?.full_name}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Employee ID: <strong className="text-white font-mono">{user?.teacher_profile?.employee_id}</strong>. New student questions are routed here automatically via WebSockets.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-2xl border border-white/10 shrink-0">
          <BellRing className="w-5 h-5 text-indigo-400 shrink-0 animate-pulse" />
          <div className="text-xs">
            <p className="font-semibold text-white">WebSocket Connected</p>
            <p className="text-[10px] text-slate-300">Listening for live submissions</p>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Accessible Doubts</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.total ?? 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Course assignments</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs bg-amber-50/20">
          <p className="text-xs font-medium text-amber-700">Pending Review</p>
          <p className="text-2xl font-bold text-amber-900 mt-1">{stats?.pending ?? 0}</p>
          <span className="text-[11px] text-amber-600 mt-1 block">Awaiting your response</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sky-200/80 shadow-xs bg-sky-50/20">
          <p className="text-xs font-medium text-sky-700">In Progress</p>
          <p className="text-2xl font-bold text-sky-900 mt-1">{stats?.in_progress ?? 0}</p>
          <span className="text-[11px] text-sky-600 mt-1 block">Clarification requested</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs bg-emerald-50/20">
          <p className="text-xs font-medium text-emerald-700">Answered & Resolved</p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{stats?.answered ?? 0}</p>
          <span className="text-[11px] text-emerald-600 mt-1 block">Successfully resolved</span>
        </div>
      </div>

      {/* Doubt Inbox Area */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Inbox className="w-5 h-5 text-violet-600" />
              <span>Incoming Doubts Queue</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review questions submitted by verified students in your department.
            </p>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student, reg no, or title..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            <option value="">All Assigned Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ANSWERED">Answered</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>

        {/* Doubts List */}
        {loading ? (
          <TableSkeleton />
        ) : doubts.length === 0 ? (
          <EmptyState
            icon="inbox"
            title="No Doubts in Queue"
            description="Your inbox is completely clear! Any newly submitted doubts in your department will appear here instantaneously in real time."
          />
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
            {doubts.map((doubt) => (
              <div
                key={doubt.id}
                onClick={() => setActiveDoubtId(doubt.doubt_id)}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-violet-700 bg-violet-50 px-2 py-0.5 rounded-md">
                      {doubt.doubt_id}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {doubt.subject_code} — {doubt.subject_name}
                    </span>
                    <Badge variant="priority" priority={doubt.priority} />
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {doubt.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <UserIcon className="w-3 h-3 text-slate-400" />
                      {doubt.student_name}
                      {doubt.student_register_number && (
                        <span className="font-mono text-violet-700 text-[10px] bg-violet-50 px-1.5 py-0.2 rounded">
                          ({doubt.student_register_number})
                        </span>
                      )}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(doubt.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    {doubt.answers_count > 0 && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        Answered ({doubt.answers_count})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <Badge variant="status" status={doubt.status} />
                  <button className="px-3 py-1.5 rounded-xl bg-violet-50 text-violet-700 hover:bg-violet-100 font-semibold text-xs transition-colors flex items-center gap-1">
                    <span>Review & Answer</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Answer Modal */}
      <TeacherAnswerModal
        doubtId={activeDoubtId}
        onClose={() => setActiveDoubtId(null)}
        onAnswerSubmitted={fetchDashboardData}
      />
    </div>
  );
};
