import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Switch } from "./ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import { CalendarIcon, Clock, Bell, HelpCircle } from "lucide-react";
import { TaskSchedule } from "../types/task";
import { cn } from "../lib/utils";

interface TaskSchedulerProps {
  schedule: TaskSchedule | null;
  onChange: (schedule: TaskSchedule) => void;
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
    time: "",
    leadDays: 0,
    leadHours: 0,
    durationDays: 0,
    durationHours: 0,
    alarmEnabled: false,
  });
  const [selectedTab, setSelectedTab] = useState<
    "today" | "tomorrow" | "custom"
  >("today");
  const [isLeadHovered, setIsLeadHovered] = useState(false);
  const [isDurationHovered, setIsDurationHovered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentSchedule(
        schedule || {
          enabled: true,
          date: new Date(),
          time: null,
          leadDays: 0,
          leadHours: 0,
          durationDays: 0,
          durationHours: 0,
          alarmEnabled: false,
        },
      );
      setSelectedTab("today");
    }
  }, [isOpen, schedule]);

  const handleTimeChange = (time: string) => {
    setCurrentSchedule((prev) => ({
      ...prev,
      time,
      // Disable alarm if time is cleared
      alarmEnabled: time ? prev.alarmEnabled : false,
    }));
  };

  const handleAlarmToggle = (checked: boolean) => {
    // Only allow enabling alarm if time is set
    if (checked && !currentSchedule.time) {
      return;
    }
    setCurrentSchedule((prev) => ({
      ...prev,
      alarmEnabled: checked,
    }));
  };

  const handleSave = () => {
    onChange(currentSchedule);
    onClose();
  };

  const handleTabChange = (tab: "today" | "tomorrow" | "custom") => {
    setSelectedTab(tab);
    const now = new Date();

    if (tab === "today") {
      setCurrentSchedule((prev) => ({
        ...prev,
        date: now,
      }));
    } else if (tab === "tomorrow") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setCurrentSchedule((prev) => ({
        ...prev,
        date: tomorrow,
      }));
    }
  };

  const InfoIcon = ({
    tooltip,
    tooltipClass,
  }: {
    tooltip: string;
    tooltipClass?: string;
  }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="w-4 h-4 ml-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 cursor-help invisible group-hover:visible" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-80 text-center">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className={cn(
            "sm:max-w-[500px]",
            "dark:bg-slate-800 dark:border-slate-700 pt-10",
          )}
        >
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="dark:text-slate-200">
                Schedule Task
              </DialogTitle>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Bell
                      className={cn(
                        "w-5 h-5",
                        !currentSchedule.time
                          ? "text-gray-300"
                          : currentSchedule.alarmEnabled
                          ? "text-purple-500"
                          : "text-gray-400",
                      )}
                    />
                    <Switch
                      checked={currentSchedule.alarmEnabled}
                      onCheckedChange={handleAlarmToggle}
                      disabled={!currentSchedule.time}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {!currentSchedule.time
                      ? "Set a specific time to enable alarm notifications."
                      : currentSchedule.alarmEnabled
                      ? "Notification scheduled for this task's time."
                      : "Toggle to receive/cancel notification at scheduled time."}
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </DialogHeader>

          <Tabs
            value={selectedTab}
            onValueChange={(v) => handleTabChange(v as any)}
          >
            <TabsList
              className={cn("grid grid-cols-3 gap-4", "dark:bg-slate-700")}
            >
              <TabsTrigger
                value="today"
                className={cn(
                  "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600",
                  "dark:text-slate-200 dark:data-[state=active]:text-slate-200",
                )}
              >
                Today
              </TabsTrigger>
              <TabsTrigger
                value="tomorrow"
                className={cn(
                  "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600",
                  "dark:text-slate-200 dark:data-[state=active]:text-slate-200",
                )}
              >
                Tomorrow
              </TabsTrigger>
              <TabsTrigger
                value="custom"
                className={cn(
                  "data-[state=active]:bg-white dark:data-[state=active]:bg-slate-600",
                  "dark:text-slate-200 dark:data-[state=active]:text-slate-200",
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
                  {selectedTab === "custom" ? (
                    <DatePicker
                      selected={currentSchedule.date}
                      onChange={(date: Date) =>
                        setCurrentSchedule((prev) => ({ ...prev, date }))
                      }
                      customInput={
                        <Input
                          className={cn(
                            "pl-8",
                            "dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200",
                            "dark:placeholder:text-slate-400",
                          )}
                          value={
                            currentSchedule.date
                              ? format(currentSchedule.date, "MMM d, yyyy")
                              : ""
                          }
                        />
                      }
                    />
                  ) : (
                    <Input
                      className={cn(
                        "pl-8",
                        "dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200",
                      )}
                      value={
                        currentSchedule.date
                          ? format(currentSchedule.date, "MMM d, yyyy")
                          : ""
                      }
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
                      "dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200",
                    )}
                    placeholder="Set Time"
                    value={currentSchedule.time || ""}
                    onChange={(e) => handleTimeChange(e.target.value)}
                  />
                  <Clock className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-slate-400" />
                </div>
              </div>
            </div>

            <div
              className="grid grid-cols-2 gap-4 mt-4"
              // onMouseEnter={() => setIsLeadHovered(true)}
              // onMouseLeave={() => setIsLeadHovered(false)}
            >
              <div className="group">
                <div className="flex items-center mb-2">
                  <Label className="dark:text-slate-200 leading-4">
                    Lead Days
                  </Label>
                  <InfoIcon tooltip="Days before due date when task appears in Do Today. For tasks needing advance preparation." />
                </div>
                <Input
                  type="number"
                  min="0"
                  value={currentSchedule.leadDays}
                  onChange={(e) =>
                    setCurrentSchedule((prev) => ({
                      ...prev,
                      leadDays: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                />
              </div>
              <div className="group">
                <div className="flex items-center mb-2">
                  <Label className="dark:text-slate-200 leading-4">
                    Lead Hours
                  </Label>
                  <InfoIcon tooltip="Hours before scheduled time when you'll be notified. Gives preparation time before start." />
                </div>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={currentSchedule.leadHours}
                  onChange={(e) =>
                    setCurrentSchedule((prev) => ({
                      ...prev,
                      leadHours: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="group">
                <div className="flex items-center mb-2">
                  <Label className="dark:text-slate-200 leading-4">
                    Duration Days
                  </Label>
                  <InfoIcon tooltip="Expected days to complete. Task stays in 'Do Today' without negative aging for this period." />
                </div>
                <Input
                  type="number"
                  min="0"
                  value={currentSchedule.durationDays}
                  onChange={(e) =>
                    setCurrentSchedule((prev) => ({
                      ...prev,
                      durationDays: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                />
              </div>
              <div className="group">
                <div className="flex items-center mb-2">
                  <Label className="dark:text-slate-200 leading-4">
                    Duration Hours
                  </Label>
                  <InfoIcon tooltip="Time needed for this task. Helps with time blocking and prevents scheduling conflicts." />
                </div>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={currentSchedule.durationHours}
                  onChange={(e) =>
                    setCurrentSchedule((prev) => ({
                      ...prev,
                      durationHours: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="mt-4">
              <Label className="mb-2 block dark:text-slate-200">
                Recurring
              </Label>
              <div className="relative">
                <select
                  className={cn(
                    "w-full border rounded-md px-3 py-2 appearance-none",
                    "dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200",
                  )}
                  value={currentSchedule.recurring?.type || "none"}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "none") {
                      setCurrentSchedule((prev) => ({
                        ...prev,
                        recurring: undefined,
                      }));
                    } else {
                      setCurrentSchedule((prev) => ({
                        ...prev,
                        recurring: {
                          type: value as NonNullable<
                            TaskSchedule["recurring"]
                          >["type"],
                          interval: 1,
                          ends: {
                            type: "endless",
                          },
                        },
                      }));
                    }
                  }}
                >
                  <option value="none">None</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {currentSchedule.recurring && (
              <>
                <div className="mt-4">
                  <Label className="mb-2 block dark:text-slate-200">
                    Interval
                  </Label>
                  <div className="flex items-center space-x-2">
                    <span className="dark:text-slate-200">Every</span>
                    <Input
                      type="number"
                      min="1"
                      className={cn(
                        "w-20",
                        "dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200",
                      )}
                      value={currentSchedule.recurring.interval}
                      onChange={(e) =>
                        setCurrentSchedule((prev) => ({
                          ...prev,
                          recurring: {
                            ...prev.recurring!,
                            interval: parseInt(e.target.value) || 1,
                          },
                        }))
                      }
                    />
                    <span className="dark:text-slate-200">
                      {currentSchedule.recurring.type === "daily" && "days"}
                      {currentSchedule.recurring.type === "weekly" && "weeks"}
                      {currentSchedule.recurring.type === "monthly" && "months"}
                      {currentSchedule.recurring.type === "yearly" && "years"}
                    </span>
                  </div>
                </div>

                {currentSchedule.recurring.type === "weekly" && (
                  <div className="mt-4">
                    <Label className="mb-2 block dark:text-slate-200">
                      Occurs on
                    </Label>
                    <div className="flex space-x-2">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                        <Button
                          key={index}
                          variant={
                            currentSchedule.recurring?.weekDays?.includes(day)
                              ? "default"
                              : "outline"
                          }
                          className={cn(
                            "w-8 h-8 p-0",
                            "dark:border-slate-600 dark:text-slate-200",
                            "dark:hover:bg-slate-600 dark:hover:text-slate-200",
                          )}
                          onClick={() => {
                            const weekDays =
                              currentSchedule.recurring?.weekDays || [];
                            const newWeekDays = weekDays.includes(day)
                              ? weekDays.filter((d) => d !== day)
                              : [...weekDays, day];
                            setCurrentSchedule((prev) => ({
                              ...prev,
                              recurring: {
                                ...prev.recurring!,
                                weekDays: newWeekDays,
                              },
                            }));
                          }}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {currentSchedule.recurring.type !== "yearly" && (
                  <div className="mt-4">
                    <Label className="mb-2 block dark:text-slate-200">
                      Workdays Only
                    </Label>
                    <Checkbox
                      checked={currentSchedule.recurring.workdaysOnly}
                      onCheckedChange={(checked) =>
                        setCurrentSchedule((prev) => ({
                          ...prev,
                          recurring: {
                            ...prev.recurring!,
                            workdaysOnly: checked === true,
                          },
                        }))
                      }
                      className="dark:border-slate-600"
                    />
                  </div>
                )}

                <div className="mt-4">
                  <Label className="mb-2 block dark:text-slate-200">Ends</Label>
                  <select
                    className={cn(
                      "w-full border rounded-md p-2",
                      "dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200",
                    )}
                    value={currentSchedule.recurring.ends?.type || "endless"}
                    onChange={(e) =>
                      setCurrentSchedule((prev) => ({
                        ...prev,
                        recurring: {
                          ...prev.recurring!,
                          ends: {
                            type: e.target.value as
                              | "date"
                              | "occurrences"
                              | "endless",
                          },
                        },
                      }))
                    }
                  >
                    <option value="endless">Never</option>
                    <option value="date">On Date</option>
                    <option value="occurrences">After Occurrences</option>
                  </select>

                  {currentSchedule.recurring.ends?.type === "date" && (
                    <div className="mt-2">
                      <DatePicker
                        selected={currentSchedule.recurring.ends.date}
                        onChange={(date: Date) =>
                          setCurrentSchedule((prev) => ({
                            ...prev,
                            recurring: {
                              ...prev.recurring!,
                              ends: {
                                type: "date",
                                date: date || undefined,
                              },
                            },
                          }))
                        }
                        customInput={
                          <Input className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200" />
                        }
                      />
                    </div>
                  )}

                  {currentSchedule.recurring.ends?.type === "occurrences" && (
                    <div className="mt-2">
                      <Input
                        type="number"
                        min="1"
                        value={currentSchedule.recurring.ends.occurrences}
                        onChange={(e) =>
                          setCurrentSchedule((prev) => ({
                            ...prev,
                            recurring: {
                              ...prev.recurring!,
                              ends: {
                                type: "occurrences",
                                occurrences:
                                  parseInt(e.target.value) || undefined,
                              },
                            },
                          }))
                        }
                        className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

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
    </TooltipProvider>
  );
};
