import React from 'react';
import { HelpCircle, FolderSearch, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'help' | 'search' | 'inbox';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  title,
  description,
  action,
}) => {
  const icons = {
    help: <HelpCircle className="w-10 h-10 text-indigo-400" />,
    search: <FolderSearch className="w-10 h-10 text-slate-400" />,
    inbox: <Inbox className="w-10 h-10 text-slate-400" />,
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-slate-200 bg-white/50">
      <div className="p-3 bg-slate-50 rounded-2xl mb-3 shadow-inner">
        {icons[icon]}
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-500/20 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
