import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { DoubtDetail, DoubtStatus } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { CardSkeleton } from '../../components/SkeletonLoader';
import {
  Send,
  User as UserIcon,
  BookOpen,
  Clock,
  History,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';

interface TeacherAnswerModalProps {
  doubtId: string | null;
  onClose: () => void;
  onAnswerSubmitted: () => void;
}

export const TeacherAnswerModal: React.FC<TeacherAnswerModalProps> = ({
  doubtId,
  onClose,
  onAnswerSubmitted,
}) => {
  const { success, error } = useToast();
  const [doubt, setDoubt] = useState<DoubtDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [answerContent, setAnswerContent] = useState('');
  const [isClarification, setIsClarification] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<DoubtStatus>('ANSWERED');

  const loadDoubt = async (id: string) => {
    setLoading(true);
    try {
      const data = await api.getTeacherDoubtDetail(id);
      setDoubt(data);
      setSelectedStatus(data.status === 'PENDING' ? 'ANSWERED' : data.status);
    } catch (err: any) {
      error('Failed to load doubt', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doubtId) {
      loadDoubt(doubtId);
      setAnswerContent('');
      setIsClarification(false);
    } else {
      setDoubt(null);
    }
  }, [doubtId]);

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtId) return;

    if (answerContent.trim().length < 5) {
      error('Input required', 'Explanation must be at least 5 characters long.');
      return;
    }

    setSubmitting(true);
    try {
      await api.answerDoubt(doubtId, {
        content: answerContent.trim(),
        is_clarification_request: isClarification,
        new_status: isClarification ? 'IN_PROGRESS' : selectedStatus,
      });

      success(
        isClarification ? 'Clarification Requested' : 'Answer Published',
        `Student ${doubt?.student_name} has been notified in real time.`
      );
      setAnswerContent('');
      onAnswerSubmitted();
      onClose();
    } catch (err: any) {
      error('Failed to publish answer', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(doubtId)}
      onClose={onClose}
      title={doubt ? `Review & Answer ${doubt.doubt_id}` : 'Doubt Review'}
      subtitle={doubt ? `${doubt.subject.code} — ${doubt.subject.name}` : ''}
      maxWidth="2xl"
    >
      {loading ? (
        <CardSkeleton />
      ) : doubt ? (
        <div className="space-y-6">
          {/* Student Info & Metadata Header */}
          <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {doubt.student_name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{doubt.student_name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Reg No: <span className="text-violet-700 font-bold">{doubt.student_register_number || 'N/A'}</span> • {doubt.student_department} (Year {doubt.student_year})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="status" status={doubt.status} />
                <Badge variant="priority" priority={doubt.priority} />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Submitted {new Date(doubt.created_at).toLocaleString()}
              </span>
              <span className="text-violet-600 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Student Identity
              </span>
            </div>
          </div>

          {/* Doubt Title & Description */}
          <div className="space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              {doubt.title}
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {doubt.description}
            </div>
          </div>

          {/* Existing answers thread */}
          {doubt.answers.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-violet-600" />
                <span>Previous Discussion ({doubt.answers.length})</span>
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {doubt.answers.map((ans) => (
                  <div key={ans.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900">{ans.teacher_name}</span>
                      <span className="text-[10px] text-slate-400">{new Date(ans.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{ans.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Answer Composer Form */}
          <form onSubmit={handleSubmitAnswer} className="space-y-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                {isClarification ? 'Request Clarification from Student' : 'Write Academic Answer / Guidance'}
              </label>
              <textarea
                required
                rows={4}
                value={answerContent}
                onChange={(e) => setAnswerContent(e.target.value)}
                placeholder={
                  isClarification
                    ? "Explain what additional details, code snippet, or lecture concept the student needs to clarify..."
                    : "Write a thorough, step-by-step academic explanation answering the student's question..."
                }
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-500 leading-relaxed resize-none"
              />
            </div>

            {/* Clarification toggle & Status selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-violet-50/50 rounded-xl border border-violet-100 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isClarification}
                  onChange={(e) => setIsClarification(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-violet-500"
                />
                <span className="font-semibold text-slate-800 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  Request Clarification (sets status to In Progress)
                </span>
              </label>

              {!isClarification && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-medium">Update Status:</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as DoubtStatus)}
                    className="px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-violet-500 font-medium"
                  >
                    <option value="ANSWERED">Answered</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-violet-600 hover:bg-violet-700 rounded-xl shadow-sm shadow-violet-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Publishing...' : isClarification ? 'Send Clarification Request' : 'Publish Answer'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </Modal>
  );
};
