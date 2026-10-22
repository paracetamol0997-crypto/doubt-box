import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { DoubtListItem, DashboardStats, Subject, DoubtStatus } from '../../types';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { TableSkeleton, CardSkeleton } from '../../components/SkeletonLoader';
import { SubmitDoubtModal } from './SubmitDoubtModal';
import { StudentDoubtDetailModal } from './StudentDoubtDetailModal';
import { wsClient } from '../../services/websocket';
import {
  PlusCircle,
  Search,
  Filter,
  Clock,
  CheckCircle,
  HelpCircle,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface StudentDashboardProps {
  initialDoubtId?: string | null;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ initialDoubtId }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [doubts, setDoubts] = useState<DoubtListItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedDoubtId, setSelectedDoubtId] = useState<string | null>(initialDoubtId || null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const [statsData, doubtsData, subjectsData] = await Promise.all([
        api.getStudentStats(),
        api.getStudentDoubts({
          search,
          subject: selectedSubject,
          status: selectedStatus,
          priority: selectedPriority,
        }),
        api.getSubjects(),
      ]);
      setStats(statsData);
      setDoubts(doubtsData);
      setSubjects(subjectsData);
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedSubject, selectedStatus, selectedPriority]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Real-time update subscription for answers or doubt changes
  useEffect(() => {
    const unsub = wsClient.onDoubtUpdate(() => {
      fetchDashboardData();
    });
    return () => {
      unsub();
    };
  }, [fetchDashboardData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Quick Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-indigo-950/20">
        <div>
          <div className="flex items-center gap-2 mb-1 text-indigo-200 text-xs font-semibold uppercase tracking-wider">
            <span>Student Academic Dashboard</span>
            <span>•</span>
            <span>{user?.student_profile?.department}</span>
            <span>•</span>
            <span>Year {user?.student_profile?.year_of_study}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-xl">
            Register No: <strong className="text-white font-mono">{user?.student_profile?.register_number}</strong>. Submit academic queries anytime with complete confidence.
          </p>
        </div>

        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-white text-indigo-900 hover:bg-indigo-50 font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-indigo-600" />
          <span>Ask a New Doubt</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Doubts</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats?.total ?? 0}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Lifetime submissions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/60 shadow-xs bg-amber-50/20">
          <p className="text-xs font-medium text-amber-700">Pending Review</p>
          <p className="text-2xl font-bold text-amber-900 mt-1">{stats?.pending ?? 0}</p>
          <span className="text-[11px] text-amber-600 mt-1 block">Awaiting teacher view</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-sky-200/60 shadow-xs bg-sky-50/20">
          <p className="text-xs font-medium text-sky-700">In Progress</p>
          <p className="text-2xl font-bold text-sky-900 mt-1">{stats?.in_progress ?? 0}</p>
          <span className="text-[11px] text-sky-600 mt-1 block">Under review / clarification</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200/60 shadow-xs bg-emerald-50/20">
          <p className="text-xs font-medium text-emerald-700">Answered</p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{stats?.answered ?? 0}</p>
          <span className="text-[11px] text-emerald-600 mt-1 block">Ready for your review</span>
        </div>
      </div>

      {/* Doubts Management Area */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">My Doubts Vault</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and track all your academic questions and professor explanations.
            </p>
          </div>

          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Submit New Doubt
          </button>
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
              placeholder="Search doubts or ID..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All Subjects</option>
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
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ANSWERED">Answered</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer"
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
            icon="help"
            title="No Doubts Found"
            description="You haven't submitted any doubts matching the current filters. Have an academic question? Ask now!"
            action={{
              label: 'Submit First Doubt',
              onClick: () => setIsSubmitModalOpen(true),
            }}
          />
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-100">
            {doubts.map((doubt) => (
              <div
                key={doubt.id}
                onClick={() => setSelectedDoubtId(doubt.doubt_id)}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
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

                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(doubt.created_at).toLocaleDateString()} at{' '}
                      {new Date(doubt.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {doubt.answers_count > 0 && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-600" />
                        {doubt.answers_count} faculty answer{doubt.answers_count > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <Badge variant="status" status={doubt.status} />
                  <span className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <SubmitDoubtModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onDoubtCreated={fetchDashboardData}
      />

      <StudentDoubtDetailModal
        doubtId={selectedDoubtId}
        onClose={() => setSelectedDoubtId(null)}
      />
    </div>
  );
};
