// src/screens/Settings/Settings.tsx
import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { Theme, getInitialTheme } from '../utils/theme';
import { cn } from '../lib/utils';
import { Settings as SettingsIcon, Globe, Clock, Shield, Moon } from 'lucide-react';

export const Settings: React.FC = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [autoSave, setAutoSave] = useState(true);
  const [darkMode, setDarkMode] = useState(theme === 'dark');
  const [timezone, setTimezone] = useState('UTC');
  const [language, setLanguage] = useState('en');

  const handleThemeChange = (enabled: boolean) => {
    setDarkMode(enabled);
    setTheme(enabled ? 'dark' : 'light');
  };

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
          <SettingsIcon className={cn(
            "w-6 h-6 mr-3",
            theme === 'dark' ? "text-[#8B5CF6]" : "text-[#5036b0]"
          )} />
          <h1 className={cn(
            "text-xl font-light",
            theme === 'dark' ? "text-gray-300" : "text-gray-600"
          )}>
            Settings
          </h1>
        </div>

        <div className="max-w-4xl mx-auto p-8">
          <div className={cn(
            "rounded-lg border p-6",
            theme === 'dark' ? "border-slate-700 bg-slate-800" : "border-gray-200"
          )}>
            <div className="space-y-6">
              <div>
                <h2 className={cn(
                  "text-lg font-semibold mb-4",
                  theme === 'dark' ? "text-white" : "text-gray-900"
                )}>
                  Appearance
                </h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Moon className={theme === 'dark' ? "text-slate-400" : "text-gray-500"} />
                    <Label className={theme === 'dark' ? "text-slate-200" : "text-gray-700"}>
                      Dark Mode
                    </Label>
                  </div>
                  <Switch
                    checked={darkMode}
                    onCheckedChange={handleThemeChange}
                  />
                </div>
              </div>

              <Separator className={theme === 'dark' ? "bg-slate-700" : undefined} />

              <div>
                <h2 className={cn(
                  "text-lg font-semibold mb-4",
                  theme === 'dark' ? "text-white" : "text-gray-900"
                )}>
                  Localization
                </h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Globe className={theme === 'dark' ? "text-slate-400" : "text-gray-500"} />
                      <Label className={theme === 'dark' ? "text-slate-200" : "text-gray-700"}>
                        Language
                      </Label>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className={cn(
                        "w-full rounded-md border p-2",
                        theme === 'dark'
                          ? "bg-slate-700 border-slate-600 text-white"
                          : "bg-white border-gray-300"
                      )}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className={theme === 'dark' ? "text-slate-400" : "text-gray-500"} />
                      <Label className={theme === 'dark' ? "text-slate-200" : "text-gray-700"}>
                        Timezone
                      </Label>
                    </div>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className={cn(
                        "w-full rounded-md border p-2",
                        theme === 'dark'
                          ? "bg-slate-700 border-slate-600 text-white"
                          : "bg-white border-gray-300"
                      )}
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="CST">Central Time</option>
                      <option value="PST">Pacific Time</option>
                    </select>
                  </div>
                </div>
              </div>

              <Separator className={theme === 'dark' ? "bg-slate-700" : undefined} />

              <div>
                <h2 className={cn(
                  "text-lg font-semibold mb-4",
                  theme === 'dark' ? "text-white" : "text-gray-900"
                )}>
                  Security
                </h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className={theme === 'dark' ? "text-slate-400" : "text-gray-500"} />
                    <Label className={theme === 'dark' ? "text-slate-200" : "text-gray-700"}>
                      Auto-save Changes
                    </Label>
                  </div>
                  <Switch
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button className="w-full">
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};