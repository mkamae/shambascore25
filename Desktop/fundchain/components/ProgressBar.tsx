import React from 'react';

interface ProgressBarProps {
  current: number;
  goal: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, goal }) => {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;

  return (
    <div>
      <div className="flex justify-between mb-1 text-sm text-slate-400">
        <span className="font-medium text-slate-300">{current.toLocaleString()} ICP Raised</span>
        <span className="font-medium text-brand-500">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div
          className="bg-brand-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
