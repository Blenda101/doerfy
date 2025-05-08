import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, CheckCircle as CircleCheckBig, LayoutGrid, HelpCircle, Settings, ChevronRight, ChevronLeft, Bell, Sun, Moon, User, BookOpen, StickyNote } from 'lucide-react';
import { cn } from '../lib/utils';
import { Theme } from '../utils/theme';
import { supabase } from '../utils/supabaseClient';

interface SidebarProps {
  isSidebarExpanded: boolean;
  theme: Theme;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isSidebarExpanded,
  theme,
  onToggleSidebar,
  onToggleTheme,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasNotifications] = React.useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();

        if (profile?.avatar_url) {
          const { data: { publicUrl } } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(profile.avatar_url);
          setAvatarUrl(publicUrl);
        }
      } catch (error) {
        console.error('Error loading avatar:', error);
      }
    };

    loadAvatar();
  }, []);

  const sidebarItems = [
    { icon: <Home className="w-5 h-5" />, label: "Home", path: "/" },
    { icon: <CircleCheckBig className="w-5 h-5" />, label: "Tasks", path: "/tasks" },
    { icon: <BookOpen className="w-5 h-5" />, label: "Stories", path: "/stories" },
    { icon: <LayoutGrid className="w-5 h-5" />, label: "Content", path: "/content" },
    { icon: <StickyNote className="w-5 h-5" />, label: "Notes", path: "/notes" },
    { icon: <HelpCircle className="w-5 h-5" />, label: "Help", path: "/help" },
    { icon: <Settings className="w-5 h-5" />, label: "Settings", path: "/settings" },
  ];

  return (
    <div className={cn(
      "h-screen flex flex-col transition-all duration-300",
      theme === 'dark' ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-gray-200',
      isSidebarExpanded ? "w-60" : "w-16",
      "border-r"
    )}>
      <div className="flex items-center justify-center py-4 mb-4">
        <img 
          src="/doerfy-logo.svg" 
          alt="Doerfy" 
          className="w-12 h-12" 
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {sidebarItems.map((item, index) => (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center px-3 py-2 rounded-lg transition-colors duration-200",
                location.pathname === item.path
                  ? "bg-[#5036b0] text-white dark:bg-[#8B5CF6]"
                  : theme === 'dark'
                    ? "text-gray-300 hover:bg-[#334155]"
                    : "text-gray-600 hover:bg-gray-100",
                !isSidebarExpanded && "justify-center"
              )}
            >
              {item.icon}
              {isSidebarExpanded && (
                <span className="ml-3 text-sm font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-2 space-y-2">
        <button
          onClick={() => navigate('/notifications')}
          className={cn(
            "w-full flex items-center rounded-lg transition-colors duration-200",
            location.pathname === '/notifications'
              ? "bg-[#5036b0] text-white dark:bg-[#8B5CF6]"
              : theme === 'dark'
                ? "text-gray-300 hover:bg-[#334155]"
                : "text-gray-600 hover:bg-gray-100",
            !isSidebarExpanded ? "justify-center p-3" : "px-3 py-2"
          )}
        >
          <div className="relative">
            <Bell className="w-5 h-5" />
            {hasNotifications && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </div>
          {isSidebarExpanded && (
            <span className="ml-3 text-sm font-medium">Notifications</span>
          )}
        </button>

        <button
          onClick={() => navigate('/profile')}
          className={cn(
            "w-full flex items-center rounded-lg transition-colors duration-200",
            location.pathname === '/profile'
              ? "bg-[#5036b0] text-white dark:bg-[#8B5CF6]"
              : theme === 'dark'
                ? "text-gray-300 hover:bg-[#334155]"
                : "text-gray-600 hover:bg-gray-100",
            !isSidebarExpanded ? "justify-center p-3" : "px-3 py-2"
          )}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className={cn(
                "rounded-full object-cover",
                !isSidebarExpanded ? "w-5 h-5" : "w-5 h-5"
              )}
            />
          ) : (
            <User className="w-5 h-5" />
          )}
          {isSidebarExpanded && (
            <span className="ml-3 text-sm font-medium">Profile</span>
          )}
        </button>

        <div className={cn(
          "flex items-center px-2 py-2",
          isSidebarExpanded ? "justify-between" : "justify-center"
        )}>
          <button
            onClick={onToggleTheme}
            className={cn(
              "p-2 rounded-lg transition-colors duration-200",
              theme === 'dark'
                ? "text-yellow-400 hover:bg-[#334155]"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          
          <button
            onClick={onToggleSidebar}
            className={cn(
              "p-2 rounded-lg transition-colors duration-200",
              theme === 'dark'
                ? "text-gray-300 hover:bg-[#334155]"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {isSidebarExpanded ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};