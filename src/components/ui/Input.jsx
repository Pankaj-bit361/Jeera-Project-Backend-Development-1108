import React from 'react';
import { cn } from '../../lib/utils';

export const Input = React.forwardRef(({ className, label, error, icon: Icon, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <Icon />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm',
            Icon && 'pl-10',
            error && 'border-red-300 focus:border-red-500 focus:ring-red-200',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
});