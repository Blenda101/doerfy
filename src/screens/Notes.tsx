import React, { useState } from 'react';
import { Notes as NotesComponent } from './Notes/Notes';
import { Theme, getInitialTheme } from '../utils/theme';
import { cn } from '../lib/utils';

export const Notes: React.FC = () => {
  const [theme] = useState<Theme>(getInitialTheme);

  return (
    <div className={cn(
      "flex h-screen",
      theme === 'dark' ? 'dark bg-[#0F172A]' : 'bg-white'
    )}>
      <NotesComponent />
    </div>
  );
};