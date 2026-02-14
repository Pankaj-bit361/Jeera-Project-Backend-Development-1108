import React from 'react';
import { cn } from '../../lib/utils';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export const Button = ({ children, className, variant = 'primary', size = 'md', isLoading, ...props }) => {
  const variants = {
    primary: 'bg-[#F97316] text-white hover:bg-[#EA580C] shadow-sm border border-transparent', // Orange accent like reference
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-sm',
    danger: 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    dark: 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <AiOutlineLoading3Quarters className="animate-spin mr-2" />}
      {children}
    </button>
  );
};