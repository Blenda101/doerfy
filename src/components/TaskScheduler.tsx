import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon, Clock, RepeatIcon } from 'lucide-react';
import { TaskSchedule } from '../types/task';
import { cn } from '../lib/utils';

interface TaskSchedulerProps {
  schedule: TaskSchedule | null;
  onChange: (schedule: TaskSchedule | null) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const TaskScheduler: React.FC<TaskSchedulerProps> = ({
  schedule,
  onChange,
  isOpen,
  onClose,
}) => {
  const [currentSchedule, setCurrentSchedule] = useState<TaskSchedule>({
    enabled: true,
    date: new Date(),
    time: '',
    leadDays: 0,
    leadHours: 0,
  });
  const [selectedTab, setSelectedTab] = useState<'today' | 'tomorrow' | 'custom'>('today');

  useEffect(() => {
    if (isOpen) {
      setCurrentSchedule(schedule || {
        enabled: true,
        date: new Date(),
        time: '',
        leadDays: 0,
        leadHours: 0,
      });
      setSelectedTab('today');
    }
  }, [isOpen, schedule]);

  const handleSave = () => {
    onChange(currentSchedule);
    onClose();
  };

  const handleTabChange = (tab: 'today' | 'tomorrow' | 'custom') => {
    setSelectedTab(tab);
    const now = new Date();
    
    if (tab === 'today') {
      setCurrentSchedule(prev => ({
        ...prev,
        date: now,
      }));
    } else if (tab === 'tomorrow') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setCurrentSchedule(prev => ({
        ...prev,
        date: tomorrow,
      }));
    }
  };

  const handleRecurringTypeChange = (type: TaskSchedule['recurring']['type']) => {
    setCurrentSchedule(prev => ({
      ...prev,
      recurring: {
        type,
        interval: 1,
        ends: {
          type: 'endless'
        },
        ...(type === 'weekly' ? { weekDays: [] } : {}),
        ...(type === 'monthly' ? { monthDay: 1 } : {}),
      }
    }));
  };

  const handleWeekDayToggle = (day: string) => {
    if (!currentSchedule.recurring?.weekDays) return;
    
    const weekDays = currentSchedule.recurring.weekDays.includes(day)
      ? currentSchedule.recurring.weekDays.filter(d => d !== day)
      : [...currentSchedule.recurring.weekDays, day];
    
    setCurrentSchedule(prev => ({
      ...prev,
      recurring: {
        ...prev.recurring!,
        weekDays
      }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "sm:max-w-[500px]",
        "dark:bg-slate-800 dark:border-slate-700"
      )}>
        <DialogHeader>
          <DialogTitle className="dark:text-slate-200">Schedule Task</DialogTitle>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={(v) => handleTabChange(v as any)}>
          <TabsList className={cn(
            "grid grid-cols-3 gap-4",
            "dark:bg-slate-700"
          )}>
            <TabsTrigger 
              value="today"
              className={cn(
                "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600",
                "dark:text-slate-200 dark:data-[state=active]:text-slate-200"
              )}
            >
              Today
            </TabsTrigger>
            <TabsTrigger 
              value="tomorrow"
              className={cn(
                "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600",
                "dark:text-slate-200 dark:data-[state=active]:text-slate-200"
              )}
            >
              Tomorrow
            </TabsTrigger>
            <TabsTrigger 
              value="custom"
              className={cn(
                "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600",
                "dark:text-slate-200 dark:data-[state=active]:text-slate-200"
              )}
            >
              Custom
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="mb-2 block dark:text-slate-200">Date</Label>
              <div className="relative">
                {selectedTab === 'custom' ? (
                  <DatePicker
                    selected={currentSchedule.date}
                    onChange={(date) => setCurrentSchedule(prev => ({ ...prev, date }))}
                    customInput={
                      <Input
                        className={cn(
                          "pl-8",
                          "dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200",
                          "dark:placeholder:text-slate-400"
                        )}
                        value={currentSchedule.date ? format(currentSchedule.date, 'MMM d, yyyy') : ''}
                      />
                    }
                  />
                ) : (
                  <Input
                    className={cn(
                      "pl-8",
                      "dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                    )}
                    value={currentSchedule.date ? format(currentSchedule.date, 'MMM d, yyyy') : ''}
                    disabled
                  />
                )}
                <CalendarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-slate-400" />
              </div>
            </div>

            <div>
              <Label className="mb-2 block dark:text-slate-200">Time</Label>
              <div className="relative">
                <Input
                  type="time"
                  className={cn(
                    "pl-8",
                    "dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  )}
                  placeholder="Set Time"
                  value={currentSchedule.time}
                  onChange={(e) => setCurrentSchedule(prev => ({ 
                    ...prev, 
                    time: e.target.value 
                  }))}
                />
                <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <Label className="mb-2 block dark:text-slate-200">Lead Days</Label>
            <Input
              type="number"
              min="0"
              value={currentSchedule.leadDays}
              onChange={(e) => setCurrentSchedule(prev => ({
                ...prev,
                leadDays: parseInt(e.target.value) || 0
              }))}
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            />
          </div>
          <div>
            <Label className="mb-2 block dark:text-slate-200">Lead Hours</Label>
            <Input
              type="number"
              min="0"
              max="23"
              value={currentSchedule.leadHours}
              onChange={(e) => setCurrentSchedule(prev => ({
                ...prev,
                leadHours: parseInt(e.target.value) || 0
              }))}
              className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            />
          </div>
        </div>

        <div className="mt-4">
          <Label className="mb-2 block dark:text-slate-200">Recurring</Label>
          <select
            className={cn(
              "w-full border rounded-md p-2",
              "dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
            )}
            value={currentSchedule.recurring?.type || 'none'}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'none') {
                setCurrentSchedule(prev => ({ ...prev, recurring: undefined }));
              } else {
                handleRecurringTypeChange(value as TaskSchedule['recurring']['type']);
              }
            }}
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {currentSchedule.recurring && (
          <>
            <div className="mt-4">
              <Label className="mb-2 block dark:text-slate-200">Interval</Label>
              <div className="flex items-center space-x-2">
                <span className="dark:text-slate-200">Every</span>
                <Input
                  type="number"
                  min="1"
                  className={cn(
                    "w-20",
                    "dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  )}
                  value={currentSchedule.recurring.interval}
                  onChange={(e) => setCurrentSchedule(prev => ({
                    ...prev,
                    recurring: {
                      ...prev.recurring!,
                      interval: parseInt(e.target.value) || 1
                    }
                  }))}
                />
                <span className="dark:text-slate-200">
                  {currentSchedule.recurring.type === 'daily' && 'days'}
                  {currentSchedule.recurring.type === 'weekly' && 'weeks'}
                  {currentSchedule.recurring.type === 'monthly' && 'months'}
                  {currentSchedule.recurring.type === 'yearly' && 'years'}
                </span>
              </div>
            </div>

            {currentSchedule.recurring.type === 'weekly' && (
              <div className="mt-4">
                <Label className="mb-2 block dark:text-slate-200">Occurs on</Label>
                <div className="flex space-x-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <Button
                      key={index}
                      variant={currentSchedule.recurring?.weekDays?.includes(day) ? 'default' : 'outline'}
                      className={cn(
                        "w-8 h-8 p-0",
                        "dark:border-slate-600 dark:text-slate-200",
                        "dark:hover:bg-slate-600 dark:hover:text-slate-200"
                      )}
                      onClick={() => handleWeekDayToggle(day)}
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {currentSchedule.recurring.type !== 'yearly' && (
              <div className="mt-4">
                <Label className="mb-2 block dark:text-slate-200">Workdays Only</Label>
                <Checkbox
                  checked={currentSchedule.recurring.workdaysOnly}
                  onCheckedChange={(checked) => setCurrentSchedule(prev => ({
                    ...prev,
                    recurring: {
                      ...prev.recurring!,
                      workdaysOnly: checked === true
                    }
                  }))}
                  className="dark:border-slate-600"
                />
              </div>
            )}

            <div className="mt-4">
              <Label className="mb-2 block dark:text-slate-200">Ends</Label>
              <select
                className={cn(
                  "w-full border rounded-md p-2",
                  "dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                )}
                value={currentSchedule.recurring.ends?.type || 'endless'}
                onChange={(e) => setCurrentSchedule(prev => ({
                  ...prev,
                  recurring: {
                    ...prev.recurring!,
                    ends: {
                      type: e.target.value as 'date' | 'occurrences' | 'endless'
                    }
                  }
                }))}
              >
                <option value="endless">Never</option>
                <option value="date">On Date</option>
                <option value="occurrences">After Occurrences</option>
              </select>

              {currentSchedule.recurring.ends?.type === 'date' && (
                <div className="mt-2">
                  <DatePicker
                    selected={currentSchedule.recurring.ends.date}
                    onChange={(date) => setCurrentSchedule(prev => ({
                      ...prev,
                      recurring: {
                        ...prev.recurring!,
                        ends: {
                          type: 'date',
                          date: date || undefined
                        }
                      }
                    }))}
                    customInput={
                      <Input className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                    }
                  />
                </div>
              )}

              {currentSchedule.recurring.ends?.type === 'occurrences' && (
                <div className="mt-2">
                  <Input
                    type="number"
                    min="1"
                    value={currentSchedule.recurring.ends.occurrences}
                    onChange={(e) => setCurrentSchedule(prev => ({
                      ...prev,
                      recurring: {
                        ...prev.recurring!,
                        ends: {
                          type: 'occurrences',
                          occurrences: parseInt(e.target.value) || undefined
                        }
                      }
                    }))}
                    className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                  />
                </div>
              )}
            </div>
          </>
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};