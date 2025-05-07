// src/screens/Notifications/Notifications.tsx
import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Theme, getInitialTheme } from '../utils/theme';
import { cn } from '../lib/utils';
import { Bell, Calendar, Clock, Mail } from 'lucide-react';

export const Notifications: React.FC = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [dueDateAlerts, setDueDateAlerts] = useState(true);

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
          <Bell className={cn(
            "w-6 h-6 mr-3",
            theme === 'dark' ? "text-[#8B5CF6]" : "text-[#5036b0]"
          )} />
          <h1 className={cn(
            "text-xl font-light",
            theme === 'dark' ? "text-gray-300" : "text-gray-600"
          )}>
            Notifications
          </h1>
        </div>

        <div className="max-w-4xl mx-auto p-8">
          <div className={cn(
            "rounded-lg border p-6",
            theme === 'dark' ? "border-slate-700 bg-slate-800" : "border-gray-200"
          )}>
            <h2 className={cn(
              "text-lg font-semibold mb-6",
              theme === 'dark' ? "text-white" : "text-gray-900"
            )}>
              Notification Preferences
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className={theme === 'dark' ? "text-slate-400" : "text-gray-500"} />
                  <Label className={theme === 'dark' ? "text-slate-200" : "text-gray-700"}>
                    Email Notifications
                  </Label>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <Separator className={theme === 'dark' ? "bg-slate-700" : undefined} />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className={theme === 'dark' ? "text-slate-400" : "text-gray-500"} />
                  <Label className={theme === 'dark' ? "text-slate-200" : "text-gray-700"}>
                    Push Notifications
                  </Label>
                </div>
                <Switch
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>

              <Separator className={theme === 'dark' ? "bg-slate-700" : undefined} />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className={theme === 'dark' ? "text-slate-400" : "text-gray-500"} />
                  <Label className={theme === 'dark' ? "text-slate-200" : "text-gray-700"}>
                    Task Reminders
                  </Label>
                </div>
                <Switch
                  checked={taskReminders}
                  onCheckedChange={setTaskReminders}
                />
              </div>

              <Separator className={theme === 'dark' ? "bg-slate-700" : undefined} />

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className={theme === 'dark' ? "text-slate-400" : "text-gray-500"} />
                  <Label className={theme === 'dark' ? "text-slate-200" : "text-gray-700"}>
                    Due Date Alerts
                  </Label>
                </div>
                <Switch
                  checked={dueDateAlerts}
                  onCheckedChange={setDueDateAlerts}
                />
              </div>
            </div>

            <div className="mt-8">
              <Button className="w-full">
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};