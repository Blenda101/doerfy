import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { StoryWithRelations } from '../types/story';
import { cn } from '../lib/utils';
import { Theme } from '../utils/theme';
import { Info, MoreHorizontal } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { StoryHoverCard } from './StoryHoverCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface StoryTableProps {
  stories: StoryWithRelations[];
  theme?: Theme;
  onView: (story: StoryWithRelations) => void;
  onDuplicate: (story: StoryWithRelations) => void;
  onDelete: (story: StoryWithRelations) => void;
  onFilterByChildren?: (storyId: string) => void;
  onUpdate?: (story: StoryWithRelations) => void;
}

export const StoryTable: React.FC<StoryTableProps> = ({
  stories,
  theme = 'light',
  onView,
  onDuplicate,
  onDelete,
  onFilterByChildren,
  onUpdate,
}) => {
  const [editingCell, setEditingCell] = useState<{ id: string; field: 'title' | 'parent' } | null>(null);
  const [editValue, setEditValue] = useState('');

  const getTypeIcon = (type: string) => {
    switch (type) {
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'MMM d, yyyy') : 'N/A';
  };

  const handleDoubleClick = (story: StoryWithRelations, field: 'title' | 'parent') => {
    setEditingCell({ id: story.id, field });
    setEditValue(field === 'title' ? story.title : story.parent?.title || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, story: StoryWithRelations) => {
    if (e.key === 'Enter') {
      handleSave(story);
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const handleSave = (story: StoryWithRelations) => {
    if (!editingCell) return;

    const updatedStory = { ...story };
    if (editingCell.field === 'title') {
      updatedStory.title = editValue.trim() || story.title;
    } else if (editingCell.field === 'parent') {
      // Here you would typically validate the parent ID exists
      // For now, we'll just update the parent title
      if (updatedStory.parent) {
        updatedStory.parent = {
          ...updatedStory.parent,
          title: editValue.trim() || story.parent?.title || ''
        };
      }
    }

    onUpdate?.(updatedStory);
    setEditingCell(null);
  };

  return (
    <div className={cn(
      "rounded-lg border",
      theme === 'dark' ? "border-slate-700" : "border-gray-200"
    )}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Key</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead>Children</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stories.map((story) => (
            <TableRow 
              key={story.id}
              className={theme === 'dark' ? "hover:bg-slate-800" : undefined}
            >
              <TableCell>
                <span className="text-2xl" title={story.type}>
                  {getTypeIcon(story.type)}
                </span>
              </TableCell>
              <TableCell className="font-mono">{story.id}</TableCell>
              <TableCell 
                onDoubleClick={() => handleDoubleClick(story, 'title')}
                className="cursor-text"
              >
                {editingCell?.id === story.id && editingCell.field === 'title' ? (
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, story)}
                    onBlur={() => handleSave(story)}
                    className={cn(
                      "w-full",
                      theme === 'dark' && "bg-slate-700 border-slate-600 text-white"
                    )}
                    autoFocus
                  />
                ) : (
                  story.title
                )}
              </TableCell>
              <TableCell 
                onDoubleClick={() => handleDoubleClick(story, 'parent')}
                className="cursor-text"
              >
                {story.parent && (
                  editingCell?.id === story.id && editingCell.field === 'parent' ? (
                    <Input
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, story)}
                      onBlur={() => handleSave(story)}
                      className={cn(
                        "w-full",
                        theme === 'dark' && "bg-slate-700 border-slate-600 text-white"
                      )}
                      autoFocus
                    />
                  ) : (
                    <div className="flex items-center space-x-1">
                      <span className="text-lg">{getTypeIcon(story.parent.type)}</span>
                      <span className="font-mono">{story.parent.id}</span>
                    </div>
                  )
                )}
              </TableCell>
              <TableCell>
                {story.childCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFilterByChildren?.(story.id)}
                  >
                    {story.childCount}
                  </Button>
                )}
              </TableCell>
              <TableCell>
                {formatDate(story.createdAt)}
              </TableCell>
              <TableCell>
                <Badge variant={story.status === 'completed' ? 'default' : 'secondary'}>
                  {story.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end space-x-2">
                  <StoryHoverCard story={story}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </StoryHoverCard>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onDuplicate(story)}>
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete(story)}
                        className="text-red-600 dark:text-red-400"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};