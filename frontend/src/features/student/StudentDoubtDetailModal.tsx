import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { Badge } from '../../components/Badge';
import { DoubtDetail } from '../../types';
import { api } from '../../services/api';
import { CardSkeleton } from '../../components/SkeletonLoader';
import { Clock, BookOpen, MessageSquare, CheckCircle, HelpCircle, History, User } from 'lucide-react';

interface StudentDoubtDetailModalProps {
  doubtId: string | null;
  onClose: () => void;
}

export const StudentDoubtDetailModal: React.FC<StudentDoubtDetailModalProps> = ({
  doubtId,
  onClose,
}) => {
  const [doubt, setDoubt] = useState<DoubtDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (doubtId) {
      setLoading(true);
      setError('');
      api.getStudentDoubtDetail(doubtId)
        .then((data) => setDoubt(data))
        .catch((err) => setError(err.message || 'Failed to load doubt details.'))
        .finally(() => setLoading(false));
    } else {
      setDoubt(null);
    }
  }, [doubtId]);

  return (
    <Modal
      isOpen={Boolean(doubtId)}
      onClose={onClose}
      title={doubt ? `${doubt.doubt_id}` : 'Doubt Details'}
      subtitle={doubt ? `${doubt.subject.code} — ${doubt.subject.name}` : ''}
      maxWidth="2xl"
    >
      {loading ? (
        <CardSkeleton />
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center">
          {error}
        </div>
      ) : doubt ? (
        <div className="space-y-6">
          {/* Top Status & Meta Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Badge variant="status" status={doubt.status} />
              <Badge variant="priority" priority={doubt.priority} />
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>Submitted {new Date(doubt.created_at).toLocaleString()}</span>
            </div>
          </div>

          {/* Question Title & Description */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 leading-snug">{doubt.title}</h3>
            <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
              {doubt.description}
            </div>
          </div>

          {/* Faculty Answers Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Faculty Explanations ({doubt.answers.length})
              </h4>
            </div>

            {doubt.answers.length === 0 ? (
              <div className="py-6 px-4 bg-amber-50/50 rounded-2xl border border-dashed border-amber-200/80 text-center">
                <p className="text-xs font-semibold text-amber-900">Waiting for Teacher Response</p>
                <p className="text-[11px] text-amber-700 mt-1">
                  Your question is in the professor's review queue. When an answer is published, you will receive an instant notification.
                </p>
              </div>
            ) : (
              doubt.answers.map((ans) => (
                <div
                  key={ans.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    ans.is_clarification_request
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-emerald-50/60 border-emerald-200/80 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                        {ans.teacher_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{ans.teacher_name}</p>
                        <p className="text-[10px] text-slate-500">{ans.teacher_department}</p>
                      </div>
                    </div>
                    {ans.is_clarification_request ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                        Clarification Request
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-700" /> Answer
                      </span>
                    )}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed mt-2 pt-2 border-t border-slate-200/50">
                    {ans.content}
                  </div>
                  <div className="mt-2 text-right text-[10px] text-slate-400">
                    {new Date(ans.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Audit Trail Timeline */}
          {doubt.status_history && doubt.status_history.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <History className="w-3.5 h-3.5" />
                <span>Status History</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {doubt.status_history.map((h) => (
                  <div key={h.id} className="flex items-center justify-between">
                    <span>
                      <strong className="text-slate-700">{h.changed_by_name}</strong>: {h.old_status} &rarr; <strong className="text-indigo-600">{h.new_status}</strong> {h.comment ? `(${h.comment})` : ''}
                    </span>
                    <span className="text-slate-400 text-[10px]">{new Date(h.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </Modal>
  );
};
