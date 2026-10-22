import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { Subject, DoubtPriority } from '../../types';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { Send, AlertCircle, BookOpen, Tag, HelpCircle, Layers } from 'lucide-react';

interface SubmitDoubtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDoubtCreated: () => void;
}

export const SubmitDoubtModal: React.FC<SubmitDoubtModalProps> = ({
  isOpen,
  onClose,
  onDoubtCreated,
}) => {
  const { success, error } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectId, setSubjectId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<DoubtPriority>('MEDIUM');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getSubjects()
        .then((subs) => {
          setSubjects(subs);
          if (subs.length > 0 && subjectId === '') {
            setSubjectId(subs[0].id);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!subjectId) {
      setErrorMessage('Please select a subject.');
      return;
    }
    if (title.trim().length < 5) {
      setErrorMessage('Title must be at least 5 characters long.');
      return;
    }
    if (description.trim().length < 10) {
      setErrorMessage('Description must be at least 10 characters long.');
      return;
    }

    setLoading(true);
    try {
      const createdDoubt = await api.submitDoubt({
        subject_id: Number(subjectId),
        title: title.trim(),
        description: description.trim(),
        priority,
      });

      success('Doubt Submitted Successfully', `Your doubt (${createdDoubt.doubt_id}) is routed to your faculty.`);
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      onDoubtCreated();
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Failed to submit doubt. Please verify fields.';
      setErrorMessage(msg);
      error('Submission Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ask a New Academic Doubt" subtitle="Submit your question privately to faculty members.">
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Subject Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Select Course / Subject</span>
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(Number(e.target.value))}
            required
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
          >
            <option value="" disabled>Choose a course</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.code} - {sub.name} ({sub.department})
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-indigo-600" />
            <span>Urgency / Priority</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as DoubtPriority[]).map((p) => {
              const isSelected = priority === p;
              return (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Doubt Title / Core Question</span>
            </span>
            <span className="text-[10px] text-slate-400">{title.length}/250</span>
          </label>
          <input
            type="text"
            required
            maxLength={250}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Why does QuickSort degrade to O(n²) in worst-case?"
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Detailed Description & What You Tried</span>
            </span>
            <span className="text-[10px] text-slate-400">{description.length} chars</span>
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your reasoning, specific formula, code snippet or slide number where you got stuck..."
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none"
          />
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {loading ? 'Submitting...' : 'Submit Doubt'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
