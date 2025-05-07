import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { StoryWithRelations } from '../types/story';
import { cn } from '../lib/utils';
import { Theme } from '../utils/theme';
import { ChevronDown, ChevronUp, Info, MoreHorizontal, Plus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface TodoQueueProps {
  todos: StoryWithRelations[];
  theme?: Theme;
  onCreateTask: (todo: StoryWithRelations, timeStage: string) => void;
  onViewTodo: (todo: StoryWithRelations) => void;
  onDeleteTodo: (todo: StoryWithRelations) => void;
}

export const TodoQueue: React.FC<TodoQueueProps> = ({
  todos,
  theme = 'light',
  onCreateTask,
  onViewTodo,
  onDeleteTodo,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-8">
      <div className="flex items-center mb-2">
        <div
          className={cn(
            "rounded-full p-1 transition-colors duration-200 cursor-pointer w-8 h-8 flex items-center justify-center group",
            "hover:bg-gray-100 dark:hover:bg-slate-700",
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown
              className={cn(
                "text-lg",
                "text-gray-500 dark:text-slate-300",
                "group-hover:text-[#5036b0] dark:group-hover:text-purple-400",
              )}
            />
          ) : (
            <ChevronUp
              className={cn(
                "text-lg",
                "text-gray-500 dark:text-slate-300",
                "group-hover:text-[#5036b0] dark:group-hover:text-purple-400",
              )}
            />
          )}
        </div>
        <h3
          className={cn(
            "font-black text-sm ml-4",
            theme === 'dark' ? "text-slate-300" : "text-black",
          )}
        >
          Todo Queue
        </h3>
        <Badge
          className={cn(
            "ml-2 h-[18px] rounded-sm",
            "bg-[#d9d9d9] dark:bg-[#334155]",
            "text-black dark:text-slate-300",
          )}
        >
          <span className="font-light text-sm">{todos.length}</span>
        </Badge>
      </div>

      {isExpanded && (
        <div className="space-y-2 mt-4">
          {todos.map((todo) => (
            <div
              key={todo.id}
              className={cn(
                "flex items-start space-x-2 p-2 rounded-lg group",
                "hover:bg-gray-50 dark:hover:bg-slate-700",
              )}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">✓</span>
                  <span
                    className={cn(
                      "font-medium",
                      theme === 'dark' ? "text-slate-200" : "text-gray-900",
                    )}
                  >
                    {todo.title}
                  </span>
                </div>
                {todo.description && (
                  <p
                    className={cn(
                      "mt-1 text-sm",
                      theme === 'dark' ? "text-slate-400" : "text-gray-500",
                    )}
                  >
                    {todo.description}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onViewTodo(todo)}
                >
                  <Info className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onCreateTask(todo, 'queue')}>
                      Add to Queue
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCreateTask(todo, 'do')}>
                      Add to Do
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCreateTask(todo, 'doing')}>
                      Add to Doing
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCreateTask(todo, 'today')}>
                      Add to Today
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteTodo(todo)}
                      className="text-red-600 dark:text-red-400"
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};