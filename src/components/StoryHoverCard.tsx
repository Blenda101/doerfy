import React from 'react';
import { StoryWithRelations } from '../types/story';
import { format, isValid } from 'date-fns';
import { cn } from '../lib/utils';
import * as HoverCard from '@radix-ui/react-hover-card';
import { Calendar, BookOpen, User, Hash } from 'lucide-react';

interface StoryHoverCardProps {
  story: StoryWithRelations;
  children: React.ReactNode;
}

export const StoryHoverCard: React.FC<StoryHoverCardProps> = ({ story, children }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'None';
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy') : 'None';
  };

  return (
    <HoverCard.Root openDelay={200} closeDelay={300}>
      <HoverCard.Trigger asChild>
        {children}
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          className={cn(
            "rounded-lg shadow-lg p-4 w-64 animate-in fade-in-0 zoom-in-95",
            "bg-white dark:bg-slate-800",
            "border border-gray-200 dark:border-slate-700"
          )}
          sideOffset={5}
          align="start"
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <div className="flex justify-between items-center w-full">
                <span className="text-sm text-gray-600 dark:text-gray-300">ID:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {story.id}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <div className="flex justify-between items-center w-full">
                <span className="text-sm text-gray-600 dark:text-gray-300">Type:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {story.type.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <div className="flex justify-between items-center w-full">
                <span className="text-sm text-gray-600 dark:text-gray-300">Assignee:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {story.assignee ? 'Assigned' : 'Unassigned'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <div className="flex justify-between items-center w-full">
                <span className="text-sm text-gray-600 dark:text-gray-300">Due Date:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {formatDate(story.dueDate)}
                </span>
              </div>
            </div>

            {story.description && (
              <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                  {story.description}
                </p>
              </div>
            )}
          </div>

          <HoverCard.Arrow className="fill-white dark:fill-slate-800" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};