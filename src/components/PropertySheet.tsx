import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { Task, TaskSchedule } from '../types/task';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { EditableProperty } from './EditableProperty';
import { RichTextEditor } from './RichTextEditor';
import { TaskHistoryTable } from './TaskHistoryTable';
import { LabelEditor } from './LabelEditor';
import { TaskScheduler } from './TaskScheduler';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { cn } from '../lib/utils';
import { Theme } from '../utils/theme';
import { supabase } from '../utils/supabaseClient';
import {
  CalendarIcon,
  ChevronDownIcon,
  XIcon,
  StarIcon,
  MoreHorizontalIcon,
  InfoIcon,
  RepeatIcon,
  Filter,
  User
} from 'lucide-react';

interface PropertySheetProps {
  task: Task;
  onClose: () => void;
  onTaskUpdate: (updatedTask: Task) => void;
  theme?: Theme;
  availableLists: string[];
}

export const PropertySheet: React.FC<PropertySheetProps> = ({
  task,
  onClose,
  onTaskUpdate,
  theme = 'light',
  availableLists = []
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(task.title);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();

        if (profile?.avatar_url) {
          const { data: { publicUrl } } = supabase
            .storage
            .from('avatars')
            .getPublicUrl(profile.avatar_url);
          setAvatarUrl(publicUrl);
        }
      } catch (error) {
        console.error('Error loading avatar:', error);
      }
    };

    loadAvatar();
  }, []);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  const handleTaskUpdate = (updates: Partial<Task>) => {
    if (!task) return;
    onTaskUpdate({ 
      ...task, 
      ...updates,
      updatedAt: new Date().toISOString()
    });
  };

  const handleTitleSave = () => {
    if (!task) return;
    
    const trimmedTitle = titleValue.trim();
    if (!trimmedTitle) {
      setTitleValue(task.title);
      setIsEditingTitle(false);
      return;
    }
    
    if (trimmedTitle !== task.title) {
      handleTaskUpdate({ title: trimmedTitle });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitleValue(task.title);
      setIsEditingTitle(false);
    }
  };

  const handleLabelsChange = (newLabels: string[]) => {
    handleTaskUpdate({ labels: newLabels });
  };

  
  // const handleScheduleChange = (schedule: Task['schedule']) => {
  //   handleTaskUpdate({ schedule });
  // };
  const handleScheduleChange = (schedule: TaskSchedule) => {
    handleTaskUpdate({ schedule });
  };

  const formatScheduleDetails = () => {
    if (!task?.schedule?.enabled || !task?.schedule?.date) return '';
    
    const date = new Date(task.schedule.date);
    const formattedDate = format(date, 'MMM d');
    const leadText = task.schedule.leadDays || task.schedule.leadHours 
      ? ` (${task.schedule.leadDays}d ${task.schedule.leadHours}h)`
      : '';

    return `${formattedDate}, ${task.schedule.time}${leadText}`;
  };

  return (
    <div className={cn(
      "w-full h-screen flex flex-col",
      theme === 'dark' ? 'bg-[#1E293B]' : 'bg-white'
    )}>
      <div className={cn(
        "h-16 flex items-center px-4 border-b",
        theme === 'dark' ? 'border-[#334155]' : 'border-[#d9d9d9]'
      )}>
        <InfoIcon className={theme === 'dark' ? 'text-[#8B5CF6]' : 'text-[#5036b0]'} />
        <h2 className={cn(
          "font-light text-xl ml-3",
          theme === 'dark' ? 'text-slate-300' : 'text-[#6f6f6f]'
        )}>About Task</h2>
        <div className="flex-grow" />
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "w-10 h-10",
            theme === 'dark' 
              ? 'text-slate-300 hover:bg-slate-700' 
              : 'text-[#6f6f6f] hover:bg-gray-100'
          )}
          onClick={onClose}
        >
          <XIcon className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <div className="px-8 py-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant={task?.schedule?.enabled ? 'default' : 'ghost'}
                className={cn(
                  "h-9 border-none rounded flex items-center text-base gap-2",
                  task?.schedule?.enabled 
                    ? "bg-[#5036b0] text-white hover:bg-[#3a2783] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED]"
                    : "bg-[#efefef] hover:bg-[#e5e5e5] dark:bg-slate-700 dark:hover:bg-slate-600"
                )}
                onClick={() => setIsSchedulerOpen(true)}
              >
                {task?.schedule?.recurring ? (
                  <RepeatIcon className={cn(
                    "w-5 h-5",
                    task?.schedule?.enabled 
                      ? "text-white" 
                      : theme === 'dark' ? "text-slate-300" : "text-[#6f6f6f]"
                  )} />
                ) : (
                  <CalendarIcon className={cn(
                    "w-5 h-5",
                    task?.schedule?.enabled 
                      ? "text-white" 
                      : theme === 'dark' ? "text-slate-300" : "text-[#6f6f6f]"
                  )} />
                )}
                <span className="font-normal">
                  {task?.schedule?.enabled ? formatScheduleDetails() : 'Schedule'}
                </span>
              </Button>

              <Button
                variant="outline"
                className={cn(
                  "h-9 rounded flex items-center gap-2",
                  theme === 'dark' 
                    ? "border-slate-600 text-slate-300" 
                    : "border-[#efefef] text-[#514f4f]"
                )}
              >
                <StarIcon className="text-yellow-500 w-5 h-5" />
                <span className="font-normal text-base">
                  Age {task.status || '0'}
                </span>
              </Button>

              <EditableProperty
                label=""
                value={task.timeStage.charAt(0).toUpperCase() + task.timeStage.slice(1)}
                options={['Queue', 'Do', 'Doing', 'Today', 'Done']}
                onChange={(value) => handleTaskUpdate({ timeStage: value.toLowerCase() as Task['timeStage'] })}
                className={cn(
                  "h-9 rounded text-base",
                  theme === 'dark' ? "bg-slate-700" : "bg-[#efefef]"
                )}
                alwaysShowChevron
                showFunnelIcon
              />

              <Button 
                variant="ghost" 
                size="sm"
                className="h-9 w-9 p-0"
              >
                <MoreHorizontalIcon className={cn(
                  "h-5 w-5",
                  theme === 'dark' ? "text-slate-300" : "text-[#6f6f6f]"
                )} />
              </Button>
            </div>
          </div>

          <div className="mb-4">
            {isEditingTitle ? (
              <Input
                ref={titleInputRef}
                value={titleValue}
                onChange={(e) => setTitleValue(e.target.value)}
                onKeyDown={handleTitleKeyDown}
                onBlur={handleTitleSave}
                className={cn(
                  "text-[21px] font-medium",
                  theme === 'dark' ? "bg-slate-700 border-slate-600 text-white" : "bg-white"
                )}
              />
            ) : (
              <h1
                className={cn(
                  "text-[21px] font-medium cursor-text",
                  theme === 'dark' ? "text-white" : "text-gray-900"
                )}
                onClick={() => setIsEditingTitle(true)}
              >
                {task.title}
              </h1>
            )}
          </div>

          <div className="mb-4">
            <h3 className={cn(
              "font-bold text-base mb-2",
              theme === 'dark' ? "text-white" : "text-gray-900"
            )}>Description</h3>
            <RichTextEditor
              content={task.description}
              onChange={(content) => handleTaskUpdate({ description: content })}
              // theme={theme}
            />
          </div>

          <div className="mb-4">
            <LabelEditor
              labels={task.labels}
              onChange={handleLabelsChange}
            />
          </div>

          <Separator className={cn(
            "my-6",
            theme === 'dark' ? "bg-slate-700" : "bg-[#d9d9d9]"
          )} />

          <Tabs defaultValue="properties">
            <TabsList className={cn(
              "bg-transparent",
              theme === 'dark' ? "border-slate-700" : "border-[#d9d9d9]"
            )}>
              <TabsTrigger
                value="properties"
                className={cn(
                  theme === 'dark'
                    ? "bg-slate-700 text-[#8B5CF6] data-[state=active]:bg-slate-700"
                    : "bg-[#efefef] text-[#5036b0] data-[state=active]:bg-[#efefef]"
                )}
              >
                Properties
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className={cn(
                  theme === 'dark'
                    ? "text-slate-300 data-[state=active]:bg-slate-700"
                    : "text-[#6f6f6f] data-[state=active]:bg-[#efefef]"
                )}
              >
                Comments
              </TabsTrigger>
              <TabsTrigger
                value="content"
                className={cn(
                  theme === 'dark'
                    ? "text-slate-300 data-[state=active]:bg-slate-700"
                    : "text-[#6f6f6f] data-[state=active]:bg-[#efefef]"
                )}
              >
                Content
              </TabsTrigger>
              <TabsTrigger
                value="visibility"
                className={cn(
                  theme === 'dark'
                    ? "text-slate-300 data-[state=active]:bg-slate-700"
                    : "text-[#6f6f6f] data-[state=active]:bg-[#efefef]"
                )}
              >
                Visibility
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className={cn(
                  theme === 'dark'
                    ? "text-slate-300 data-[state=active]:bg-slate-700"
                    : "text-[#6f6f6f] data-[state=active]:bg-[#efefef]"
                )}
              >
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="mt-6">
              <div className="grid grid-cols-2 gap-y-8">
                <EditableProperty
                  label="Assignee"
                  value="Me"
                  icon={
                    avatarUrl ? (
                      <img
                        className="w-6 h-6 rounded-full object-cover"
                        alt="Assignee"
                        src={avatarUrl}
                      />
                    ) : (
                      <User className="w-6 h-6" />
                    )
                  }
                  options={['Me', 'Maria Smith', 'John Doe']}
                  onChange={(value) => handleTaskUpdate({ assignee: value })}
                />

                <EditableProperty
                  label="List"
                  value={task.listId || ''}
                  options={availableLists}
                  onChange={(value) => handleTaskUpdate({ listId: value })}
                  disabled={availableLists.length === 0}
                />

                <EditableProperty
                  label="Priority"
                  value={task.priority?.charAt(0).toUpperCase() + task.priority?.slice(1) || 'Medium'}
                  icon={<div className="text-red-500 text-lg">●</div>}
                  options={['High', 'Medium', 'Low']}
                  onChange={(value) => 
                    handleTaskUpdate({ 
                      priority: value.toLowerCase() as Task['priority']
                    })
                  }
                />

                <EditableProperty
                  label="Energy"
                  value={task.energy?.charAt(0).toUpperCase() + task.energy?.slice(1) || 'Medium'}
                  icon={<div className="text-yellow-500 text-lg">●</div>}
                  options={['High', 'Medium', 'Low']}
                  onChange={(value) => 
                    handleTaskUpdate({ 
                      energy: value.toLowerCase() as Task['energy']
                    })
                  }
                />

                <EditableProperty
                  label="Location"
                  value={task.location || 'None'}
                  options={['Home', 'Office', 'Outside']}
                  onChange={(value) => handleTaskUpdate({ location: value })}
                />

                <EditableProperty
                  label="Story"
                  value={task.story || 'None'}
                  options={['Brazil Vacation', 'Home Renovation', 'Career Goals']}
                  onChange={(value) => handleTaskUpdate({ story: value })}
                />
              </div>

              <div className={cn(
                "mt-16 text-base",
                theme === 'dark' ? "text-slate-400" : "text-[#6f6f6f]"
              )}>
                Created {new Date(task.createdAt).toLocaleString()}
                <br />
                Updated {new Date(task.updatedAt).toLocaleString()}
              </div>
            </TabsContent>

            <TabsContent value="visibility" className="mt-6">
              <div className="grid grid-cols-1 gap-y-4">
                <div>
                  <Label className={cn(
                    "inline-flex items-center space-x-2",
                    theme === 'dark' ? "text-slate-200" : "text-gray-700"
                  )}>
                    <Checkbox
                      checked={task.showInTimeBox}
                      onCheckedChange={(checked) => handleTaskUpdate({ showInTimeBox: checked === true })}
                      className="dark:border-slate-600"
                    />
                    <span>Show in Time Box</span>
                  </Label>
                </div>
                <div>
                  <Label className={cn(
                    "inline-flex items-center space-x-2",
                    theme === 'dark' ? "text-slate-200" : "text-gray-700"
                  )}>
                    <Checkbox
                      checked={task.showInList}
                      onCheckedChange={(checked) => handleTaskUpdate({ showInList: checked === true })}
                      className="dark:border-slate-600"
                    />
                    <span>Show in List</span>
                  </Label>
                </div>
                <div>
                  <Label className={cn(
                    "inline-flex items-center space-x-2",
                    theme === 'dark' ? "text-slate-200" : "text-gray-700"
                  )}>
                    <Checkbox
                      checked={task.showInCalendar}
                      onCheckedChange={(checked) => handleTaskUpdate({ showInCalendar: checked === true })}
                      className="dark:border-slate-600"
                    />
                    <span>Show in Calendar</span>
                  </Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <TaskHistoryTable history={task.history} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <TaskScheduler
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        schedule={task?.schedule || null}
        onChange={handleScheduleChange}
      />
    </div>
  );
};