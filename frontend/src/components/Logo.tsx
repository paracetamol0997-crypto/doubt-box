import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showTagline = false }) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Icon: Modern speech bubble with inner doubt question dot */}
      <div
        className={`${iconSizes[size]} bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500/10 shrink-0`}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 6C4 4.89543 4.89543 4 6 4H18C19.1046 4 20 4.89543 20 6V14C20 15.1046 19.1046 16 18 16H12L7 20V16H6C4.89543 16 4 15.1046 4 14V6Z" fillOpacity="0.25"/>
          <path d="M12 7.5C11.1716 7.5 10.5 8.17157 10.5 9C10.5 9.41421 10.8358 9.75 11.25 9.75C11.6642 9.75 12 9.41421 12 9C12 8.58579 12.3358 8.25 12.75 8.25C13.1642 8.25 13.5 8.58579 13.5 9C13.5 9.8 12 10.2 12 11.8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <circle cx="12.05" cy="13.75" r="0.9" fill="white"/>
        </svg>
      </div>

      <div>
        <div className="flex items-center gap-1.5">
          <span className={`${titleSizes[size]} font-bold tracking-tight text-slate-900`}>
            Doubt<span className="text-indigo-600">Box</span>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100">
            EDU
          </span>
        </div>
        {showTagline && (
          <p className="text-[11px] text-slate-500 font-medium tracking-tight">Ask Freely. Learn Confidently.</p>
        )}
      </div>
    </div>
  );
};
