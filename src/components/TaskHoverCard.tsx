import React from 'react';
import { Task } from '../types/task';
import { format } from 'date-fns';
import { CalendarIcon, ListIcon, AlertTriangleIcon, BatteryChargingIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import * as HoverCard from '@radix-ui/react-hover-card';

interface TaskHoverCardProps {
  task: Task;
  children: React.ReactNode;
}

export const TaskHoverCard: React.FC<TaskHoverCardProps> = ({ task, children }) => {
  // Return null if task is undefined or null
  if (!task) {
    return children;
  }

  const taskAge = () => {
    if (!task?.stageEntryDate) return 0;
    
    const entryDate = new Date(task.stageEntryDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - entryDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'None';
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-500 dark:text-red-400';
      case 'medium':
        return 'text-yellow-500 dark:text-yellow-400';
      case 'low':
        return 'text-green-500 dark:text-green-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
  };

  const getEnergyColor = (energy: string) => {
    switch (energy?.toLowerCase()) {
      case 'high':
        return 'text-purple-500 dark:text-purple-400';
      case 'medium':
        return 'text-blue-500 dark:text-blue-400';
      case 'low':
        return 'text-gray-500 dark:text-gray-400';
      default:
        return 'text-gray-500 dark:text-gray-400';
    }
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
              <CalendarIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <div className="flex justify-between items-center w-full">
                <span className="text-sm text-gray-600 dark:text-gray-300">Age:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {taskAge()} days
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <div className="flex justify-between items-center w-full">
                <span className="text-sm text-gray-600 dark:text-gray-300">Schedule:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {task.schedule?.date ? format(new Date(task.schedule.date), 'MMM d, yyyy') : 'None'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ListIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <div className="flex justify-between items-center w-full">
                <span className="text-sm text-gray-600 dark:text-gray-300">List:</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {task.listId || 'None'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <div className="flex justify-between items-center w-full">
                <span className="text-sm text-gray-600 dark:text-gray-300">Priority:</span>
                <span className={cn(
                  "text-sm font-medium",
                  getPriorityColor(task.priority || '')
                )}>
                  {task.priority || 'None'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BatteryChargingIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <div className="flex justify-between items-center w-full">
                <span className="text-sm text-gray-600 dark:text-gray-300">Energy:</span>
                <span className={cn(
                  "text-sm font-medium",
                  getEnergyColor(task.energy || '')
                )}>
                  {task.energy || 'None'}
                </span>
              </div>
            </div>
          </div>

          <HoverCard.Arrow className="fill-white dark:fill-slate-800" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};