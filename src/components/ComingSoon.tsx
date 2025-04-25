import React from 'react';
import { cn } from '../lib/utils';
import { Theme } from '../utils/theme';

interface ComingSoonProps {
  theme?: Theme;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ theme = 'light' }) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-screen",
      theme === 'dark' ? 'bg-[#0F172A]' : 'bg-white'
    )}>
      <img
        src="/doerfy-logo.svg"
        alt="Doerfy"
        className="w-32 h-32 mb-8"
      />
      <h1 className={cn(
        "text-4xl font-bold mb-4",
        theme === 'dark' ? 'text-white' : 'text-gray-900'
      )}>
        Coming Soon
      </h1>
      <p className={cn(
        "text-xl",
        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
      )}>
        This feature is currently under development
      </p>
    </div>
  );
};