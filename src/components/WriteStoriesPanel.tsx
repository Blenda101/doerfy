import React from 'react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { Theme } from '../utils/theme';
import { X, PencilLine } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

interface WriteStoriesPanelProps {
  onClose: () => void;
  onSelect: (type: 'theme' | 'mega_do' | 'project' | 'todo') => void;
  theme?: Theme;
}

export const WriteStoriesPanel: React.FC<WriteStoriesPanelProps> = ({
  onClose,
  onSelect,
  theme = 'light'
}) => {
  return (
    <div className={cn(
      "w-[400px] h-screen flex flex-col",
      theme === 'dark' ? 'bg-[#1E293B]' : 'bg-white'
    )}>
      <div className={cn(
        "h-16 flex items-center px-6 border-b",
        theme === 'dark' ? 'border-[#334155]' : 'border-gray-200'
      )}>
        <div className="flex items-center flex-1">
          <PencilLine className={cn(
            "w-5 h-5 mr-2",
            theme === 'dark' ? 'text-[#8B5CF6]' : 'text-[#5036b0]'
          )} />
          <h2 className={cn(
            "text-xl font-light",
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          )}>
            Write Stories
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-10 w-10"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-6">
        <h3 className={cn(
          "text-lg mb-6",
          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
        )}>
          What type of story would you like to write?
        </h3>

        <RadioGroup
          defaultValue="theme"
          onValueChange={(value) => onSelect(value as any)}
          className="space-y-6"
        >
          <div>
            <RadioGroupItem value="theme" id="theme" className="peer sr-only" />
            <Label
              htmlFor="theme"
              className={cn(
                "flex flex-col space-y-2 rounded-lg border p-4 cursor-pointer transition-colors",
                "hover:bg-gray-50 dark:hover:bg-slate-700",
                "peer-checked:border-purple-600 dark:peer-checked:border-purple-400",
                theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
              )}
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🎯</span>
                <span className={cn(
                  "font-semibold",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  Theme
                </span>
              </div>
              <p className={cn(
                "text-sm",
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              )}>
                Define your vision, mission and goals here. The theme will ultimately guide your work and gives it meaning.
              </p>
            </Label>
          </div>

          <div>
            <RadioGroupItem value="mega_do" id="mega_do" className="peer sr-only" />
            <Label
              htmlFor="mega_do"
              className={cn(
                "flex flex-col space-y-2 rounded-lg border p-4 cursor-pointer transition-colors",
                "hover:bg-gray-50 dark:hover:bg-slate-700",
                "peer-checked:border-purple-600 dark:peer-checked:border-purple-400",
                theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
              )}
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📋</span>
                <span className={cn(
                  "font-semibold",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  Mega Do
                </span>
              </div>
              <p className={cn(
                "text-sm",
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              )}>
                Create a major initiative that connects goals to concrete projects and measurable outcomes.
              </p>
            </Label>
          </div>

          <div>
            <RadioGroupItem value="project" id="project" className="peer sr-only" />
            <Label
              htmlFor="project"
              className={cn(
                "flex flex-col space-y-2 rounded-lg border p-4 cursor-pointer transition-colors",
                "hover:bg-gray-50 dark:hover:bg-slate-700",
                "peer-checked:border-purple-600 dark:peer-checked:border-purple-400",
                theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
              )}
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📁</span>
                <span className={cn(
                  "font-semibold",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  Project
                </span>
              </div>
              <p className={cn(
                "text-sm",
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              )}>
                Coordinate resources and effort toward a specific outcome. Organizes related tasks and tracks progress.
              </p>
            </Label>
          </div>

          <div>
            <RadioGroupItem value="todo" id="todo" className="peer sr-only" />
            <Label
              htmlFor="todo"
              className={cn(
                "flex flex-col space-y-2 rounded-lg border p-4 cursor-pointer transition-colors",
                "hover:bg-gray-50 dark:hover:bg-slate-700",
                "peer-checked:border-purple-600 dark:peer-checked:border-purple-400",
                theme === 'dark' ? 'border-slate-700' : 'border-gray-200'
              )}
            >
              <div className="flex items-center space-x-2">
                <span className="text-2xl">✓</span>
                <span className={cn(
                  "font-semibold",
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                )}>
                  Todo
                </span>
              </div>
              <p className={cn(
                "text-sm",
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              )}>
                Frame stories from the perspective of what users want to do, so that actionable units of work can be generated in the form of Task.
              </p>
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
};