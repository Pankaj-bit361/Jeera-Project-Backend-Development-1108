import React from 'react';
import { cn } from '../../lib/utils';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

export const Button = ({ children, className, variant = 'primary', isLoading, ...props }) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
  };

  return (
    <button
      className={cn(
        'flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
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