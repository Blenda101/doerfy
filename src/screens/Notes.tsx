import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { ComingSoon } from '../components/ComingSoon';
import { Theme, getInitialTheme } from '../utils/theme';
import { cn } from '../lib/utils';

export const Notes: React.FC = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  return (
    <div className={cn(
      "flex h-screen",
      theme === 'dark' ? 'dark bg-[#0F172A]' : 'bg-white'
    )}>
      <Sidebar
        isSidebarExpanded={isSidebarExpanded}
        theme={theme}
        onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        onToggleTheme={() => setTheme(current => current === 'dark' ? 'light' : 'dark')}
      />
      <div className="flex-1">
        <ComingSoon theme={theme} />
      </div>
    </div>
  );
};