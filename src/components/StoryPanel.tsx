import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RichTextEditor } from './RichTextEditor';
import { LabelEditor } from './LabelEditor';
import { Story, StoryType } from '../types/story';
import { cn } from '../lib/utils';
import { Theme } from '../utils/theme';
import {
  X,
  Maximize2,
  ChevronDown,
  Calendar,
  BookOpen,
  Target,
  ClipboardList,
  Folder,
  CheckSquare,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface StoryPanelProps {
  story: Story;
  onClose: () => void;
  onUpdate: (story: Story) => void;
  theme?: Theme;
  availableParents?: Story[];
}

export const StoryPanel: React.FC<StoryPanelProps> = ({
  story,
  onClose,
  onUpdate,
  theme = 'light',
  availableParents = [],
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  const handleUpdate = (updates: Partial<Story>) => {
    onUpdate({
      ...story,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  const getStoryTypeIcon = (type: StoryType) => {
    switch (type) {
      case 'theme':
        return <Target className="w-6 h-6" />;
      case 'mega_do':
        return <ClipboardList className="w-6 h-6" />;
      case 'project':
        return <Folder className="w-6 h-6" />;
      case 'todo':
        return <CheckSquare className="w-6 h-6" />;
      default:
        return <BookOpen className="w-6 h-6" />;
    }
  };

  const getStoryTypeLabel = (type: StoryType) => {
    switch (type) {
      case 'mega_do':
        return 'Mega Do';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className={cn(
      "flex flex-col h-full transition-all duration-300",
      isMaximized ? "fixed inset-4 z-50 rounded-lg shadow-xl" : "w-[600px]",
      theme === 'dark' ? "bg-slate-800" : "bg-white"
    )}>
      {/* Header */}
      <div className={cn(
        "h-16 flex items-center px-6 border-b",
        theme === 'dark' ? "border-slate-700" : "border-gray-200"
      )}>
        <div className="flex items-center">
          <span className={cn(
            "text-lg font-medium",
            theme === 'dark' ? "text-slate-300" : "text-gray-600"
          )}>
            About {getStoryTypeLabel(story.type)}
          </span>
        </div>
        <div className="flex-grow" />
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={() => setIsMaximized(!isMaximized)}>
            <Maximize2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Story Type and ID Badge */}
      <div className="px-6 py-4 border-b dark:border-slate-700">
        <div className={cn(
          "inline-flex items-center space-x-3 px-4 py-2 rounded-lg",
          theme === 'dark' ? "bg-slate-700" : "bg-gray-50"
        )}>
          {getStoryTypeIcon(story.type)}
          <span className={cn(
            "font-mono text-sm",
            theme === 'dark' ? "text-slate-300" : "text-gray-600"
          )}>
            {story.id}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div>
          <Label>Title</Label>
          <Input
            value={story.title}
            onChange={(e) => handleUpdate({ title: e.target.value })}
            className={cn(
              theme === 'dark' && "bg-slate-700 border-slate-600 text-white"
            )}
          />
        </div>

        {story.type === 'theme' && (
          <>
            <div>
              <Label>Vision</Label>
              <RichTextEditor
                content={story.vision || ''}
                onChange={(content) => handleUpdate({ vision: content })}
              />
            </div>
            <div>
              <Label>Mission</Label>
              <RichTextEditor
                content={story.mission || ''}
                onChange={(content) => handleUpdate({ mission: content })}
              />
            </div>
            <div>
              <Label>Goals</Label>
              <RichTextEditor
                content={story.goals?.join('\n') || ''}
                onChange={(content) => handleUpdate({ 
                  goals: content.split('\n').filter(Boolean)
                })}
              />
            </div>
          </>
        )}

        {(story.type === 'mega_do' || story.type === 'project' || story.type === 'todo') && (
          <>
            <div>
              <Label>Parent</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between",
                      theme === 'dark' && "bg-slate-700 border-slate-600 text-white"
                    )}
                  >
                    {story.parentId ? 
                      availableParents.find(p => p.id === story.parentId)?.title || 'Select Parent' 
                      : 'Select Parent'
                    }
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {availableParents.map((parent) => (
                    <DropdownMenuItem
                      key={parent.id}
                      onClick={() => handleUpdate({ parentId: parent.id })}
                    >
                      {parent.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div>
              <Label>Story</Label>
              <RichTextEditor
                content={story.description}
                onChange={(content) => handleUpdate({ description: content })}
              />
            </div>

            <div>
              <Label>What Does Done Look Like?</Label>
              <RichTextEditor
                content={story.whatDoneLooksLike || ''}
                onChange={(content) => handleUpdate({ whatDoneLooksLike: content })}
              />
            </div>

            {story.type !== 'todo' && (
              <div>
                <Label>Due Date</Label>
                <div className="relative">
                  <DatePicker
                    selected={story.dueDate ? new Date(story.dueDate) : null}
                    onChange={(date) => handleUpdate({ 
                      dueDate: date ? date.toISOString() : null 
                    })}
                    customInput={
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start",
                          theme === 'dark' && "bg-slate-700 border-slate-600 text-white"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {story.dueDate ? 
                          new Date(story.dueDate).toLocaleDateString() 
                          : 'Select date'
                        }
                      </Button>
                    }
                  />
                </div>
              </div>
            )}

            {story.type === 'todo' && (
              <div>
                <Label>Effort Estimate</Label>
                <Input
                  type="number"
                  value={story.effortEstimate || ''}
                  onChange={(e) => handleUpdate({ 
                    effortEstimate: parseInt(e.target.value) || null 
                  })}
                  className={cn(
                    theme === 'dark' && "bg-slate-700 border-slate-600 text-white"
                  )}
                />
              </div>
            )}
          </>
        )}

        <div>
          <LabelEditor
            labels={story.labels}
            onChange={(labels) => handleUpdate({ labels })}
          />
        </div>
      </div>
    </div>
  );
};