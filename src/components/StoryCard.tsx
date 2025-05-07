import React from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { StoryWithRelations } from '../types/story';
import { cn } from '../lib/utils';
import { Theme } from '../utils/theme';
import { Info, MoreHorizontal } from 'lucide-react';
import { StoryHoverCard } from './StoryHoverCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface StoryCardProps {
  story: StoryWithRelations;
  theme?: Theme;
  onView: (story: StoryWithRelations) => void;
  onDuplicate: (story: StoryWithRelations) => void;
  onDelete: (story: StoryWithRelations) => void;
  onFilterByChildren?: (storyId: string) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  theme = 'light',
  onView,
  onDuplicate,
  onDelete,
  onFilterByChildren,
}) => {
  const getTypeIcon = () => {
    switch (story.type) {
      case 'theme':
        return '🎯';
      case 'mega_do':
        return '📋';
      case 'project':
        return '📁';
      case 'todo':
        return '✓';
      default:
        return '📄';
    }
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all duration-200 cursor-pointer group",
        "hover:shadow-lg hover:scale-[1.02]",
        theme === 'dark' 
          ? "bg-slate-800 border-slate-700 hover:border-slate-600" 
          : "bg-white border-gray-200 hover:border-gray-300"
      )}
      onClick={() => onView(story)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{getTypeIcon()}</span>
          <span className={cn(
            "text-sm font-medium",
            theme === 'dark' ? "text-slate-400" : "text-gray-500"
          )}>
            {story.id}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <StoryHoverCard story={story}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <Info className="h-4 w-4" />
            </Button>
          </StoryHoverCard>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onView(story);
              }}>
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onDuplicate(story);
              }}>
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(story);
                }}
                className="text-red-600 dark:text-red-400"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <h3 className={cn(
        "text-lg font-semibold mb-2",
        theme === 'dark' ? "text-white" : "text-gray-900"
      )}>
        {story.title}
      </h3>

      {(story.type === 'theme' && story.vision) && (
        <p className={cn(
          "text-sm mb-3",
          theme === 'dark' ? "text-slate-300" : "text-gray-600"
        )}>
          {story.vision}
        </p>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          <Info className="h-4 w-4 text-gray-400" />
          {story.childCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={(e) => {
                e.stopPropagation();
                onFilterByChildren?.(story.id);
              }}
            >
              {story.childCount} {story.type === 'theme' ? 'Mega Dos' : story.type === 'mega_do' ? 'Projects' : 'Todos'}
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {story.labels.map((label) => (
            <Badge key={label} variant="secondary">
              {label}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};