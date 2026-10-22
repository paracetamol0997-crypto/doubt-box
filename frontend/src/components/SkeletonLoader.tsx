import React from 'react';

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-200 rounded w-24" />
        <div className="h-5 bg-slate-200 rounded-full w-20" />
      </div>
      <div className="h-5 bg-slate-200 rounded w-3/4" />
      <div className="h-4 bg-slate-100 rounded w-full" />
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="h-3 bg-slate-200 rounded w-20" />
        <div className="h-3 bg-slate-200 rounded w-16" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 bg-white rounded-xl border border-slate-200/80 p-4 flex items-center justify-between">
          <div className="space-y-2 w-1/3">
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/2" />
          </div>
          <div className="h-6 bg-slate-200 rounded-full w-24" />
          <div className="h-4 bg-slate-200 rounded w-16" />
        </div>
      ))}
    </div>
  );
};
