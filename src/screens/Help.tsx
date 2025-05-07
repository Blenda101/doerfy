// src/screens/Help/Help.tsx
import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Theme, getInitialTheme } from '../utils/theme';
import { cn } from '../lib/utils';
import { HelpCircle, Search, Book, Video, MessageCircle, ExternalLink } from 'lucide-react';

export const Help: React.FC = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    {
      title: 'Getting Started',
      icon: Book,
      items: [
        { title: 'Quick Start Guide', link: '#' },
        { title: 'Basic Navigation', link: '#' },
        { title: 'Creating Your First Task', link: '#' },
      ]
    },
    {
      title: 'Video Tutorials',
      icon: Video,
      items: [
        { title: 'Task Management Basics', link: '#' },
        { title: 'Advanced Features', link: '#' },
        { title: 'Tips and Tricks', link: '#' },
      ]
    },
    {
      title: 'FAQ',
      icon: MessageCircle,
      items: [
        { title: 'Common Questions', link: '#' },
        { title: 'Troubleshooting', link: '#' },
        { title: 'Known Issues', link: '#' },
      ]
    }
  ];

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
        <div className={cn(
          "h-16 border-b flex items-center px-6",
          theme === 'dark' ? "border-[#334155] bg-[#1E293B]" : "border-gray-200"
        )}>
          <HelpCircle className={cn(
            "w-6 h-6 mr-3",
            theme === 'dark' ? "text-[#8B5CF6]" : "text-[#5036b0]"
          )} />
          <h1 className={cn(
            "text-xl font-light",
            theme === 'dark' ? "text-gray-300" : "text-gray-600"
          )}>
            Help Center
          </h1>
        </div>

        <div className="max-w-4xl mx-auto p-8">
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "pl-10",
                  theme === 'dark' && "bg-slate-800 border-slate-700"
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-lg border p-6",
                  theme === 'dark' ? "border-slate-700 bg-slate-800" : "border-gray-200"
                )}
              >
                <div className="flex items-center mb-4">
                  <category.icon className={cn(
                    "w-5 h-5 mr-2",
                    theme === 'dark' ? "text-[#8B5CF6]" : "text-[#5036b0]"
                  )} />
                  <h2 className={cn(
                    "text-lg font-semibold",
                    theme === 'dark' ? "text-white" : "text-gray-900"
                  )}>
                    {category.title}
                  </h2>
                </div>
                <ul className="space-y-3">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <a
                        href={item.link}
                        className={cn(
                          "flex items-center text-sm hover:underline",
                          theme === 'dark' ? "text-slate-300" : "text-gray-600"
                        )}
                      >
                        {item.title}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className={cn(
            "mt-8 p-6 rounded-lg border text-center",
            theme === 'dark' ? "border-slate-700 bg-slate-800" : "border-gray-200"
          )}>
            <h2 className={cn(
              "text-lg font-semibold mb-2",
              theme === 'dark' ? "text-white" : "text-gray-900"
            )}>
              Need More Help?
            </h2>
            <p className={cn(
              "mb-4",
              theme === 'dark' ? "text-slate-300" : "text-gray-600"
            )}>
              Can't find what you're looking for? Contact our support team.
            </p>
            <Button>
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
