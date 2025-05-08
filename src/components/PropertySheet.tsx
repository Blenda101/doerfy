import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Task, TaskSchedule } from "../types/task";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { EditableProperty } from "./EditableProperty";
import { TaskHistoryTable } from "./TaskHistoryTable";
import { LabelEditor } from "./LabelEditor";
import { TaskScheduler } from "./TaskScheduler";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { EditableTitle } from "./forms/EditableTitle";
import { cn } from "../lib/utils";
import { Theme } from "../utils/theme";
import { supabase } from "../utils/supabaseClient";
import {
  CalendarIcon,
  StarIcon,
  MoreHorizontalIcon,
  InfoIcon,
  RepeatIcon,
  User,
} from "lucide-react";
import { Sheet } from "./Sheet";
import { Editor } from "./forms/Editor";

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
  theme = "light",
  availableLists = [],
}) => {
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single();

        if (profile?.avatar_url) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("avatars").getPublicUrl(profile.avatar_url);
          setAvatarUrl(publicUrl);
        }
      } catch (error) {
        console.error("Error loading avatar:", error);
      }
    };

    loadAvatar();
  }, []);

  const handleTaskUpdate = (updates: Partial<Task>) => {
    if (!task) return;
    onTaskUpdate({
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleTitleChange = (newTitle: string) => {
    handleTaskUpdate({ title: newTitle });
  };

  const handleLabelsChange = (newLabels: string[]) => {
    handleTaskUpdate({ labels: newLabels });
  };

  const handleScheduleChange = (schedule: TaskSchedule) => {
    handleTaskUpdate({ schedule });
  };

  const formatScheduleDetails = () => {
    if (!task?.schedule?.enabled || !task?.schedule?.date) return "";

    const date = new Date(task.schedule.date);
    const formattedDate = format(date, "MMM d");
    const leadText =
      task.schedule.leadDays || task.schedule.leadHours
        ? ` (${task.schedule.leadDays}d ${task.schedule.leadHours}h)`
        : "";

    return `${formattedDate}, ${task.schedule.time}${leadText}`;
  };

  // Header actions for the Sheet component
  const headerActions = (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 rounded-full flex items-center justify-center"
    >
      <MoreHorizontalIcon className="h-5 w-5" />
    </Button>
  );

  return (
    <Sheet
      title="About Task"
      icon={<InfoIcon className="w-5 h-5" />}
      onClose={onClose}
      theme={theme}
      headerActions={headerActions}
    >
      {/* Sticky Title Container */}
      <div className="sticky top-0 bg-inherit z-50 -mt-6 pt-6 pb-4">
        <EditableTitle
          title={task.title}
          onTitleChange={handleTitleChange}
          theme={theme}
        />
      </div>

      {/* Scrollable Content */}
      <div className="space-y-6">
        {/* Task Actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant={task?.schedule?.enabled ? "default" : "ghost"}
              className={cn(
                "h-9 border-none rounded flex items-center text-base gap-2",
                task?.schedule?.enabled
                  ? "bg-[#5036b0] text-white hover:bg-[#3a2783] dark:bg-[#8B5CF6] dark:hover:bg-[#7C3AED]"
                  : "bg-[#efefef] hover:bg-[#e5e5e5] dark:bg-slate-700 dark:hover:bg-slate-600",
              )}
              onClick={() => setIsSchedulerOpen(true)}
            >
              {task?.schedule?.recurring ? (
                <RepeatIcon
                  className={cn(
                    "w-5 h-5",
                    task?.schedule?.enabled
                      ? "text-white"
                      : theme === "dark"
                      ? "text-slate-300"
                      : "text-[#6f6f6f]",
                  )}
                />
              ) : (
                <CalendarIcon
                  className={cn(
                    "w-5 h-5",
                    task?.schedule?.enabled
                      ? "text-white"
                      : theme === "dark"
                      ? "text-slate-300"
                      : "text-[#6f6f6f]",
                  )}
                />
              )}
              <span className="font-normal">
                {task?.schedule?.enabled ? formatScheduleDetails() : "Schedule"}
              </span>
            </Button>

            <Button
              variant="outline"
              className={cn(
                "h-9 rounded flex items-center gap-2",
                theme === "dark"
                  ? "border-slate-600 text-slate-300"
                  : "border-[#efefef] text-[#514f4f]",
              )}
            >
              <StarIcon className="text-yellow-500 w-5 h-5" />
              <span className="font-normal text-base">
                Age {task.status || "0"}
              </span>
            </Button>

            <EditableProperty
              label=""
              value={
                task.timeStage.charAt(0).toUpperCase() + task.timeStage.slice(1)
              }
              options={["Queue", "Do", "Doing", "Today", "Done"]}
              onChange={(value) =>
                handleTaskUpdate({
                  timeStage: value.toLowerCase() as Task["timeStage"],
                })
              }
              className={cn(
                "h-9 rounded text-base",
                theme === "dark" ? "bg-slate-700" : "bg-[#efefef]",
              )}
              alwaysShowChevron
              showFunnelIcon
            />
          </div>
        </div>

        {/* Task Description */}
        <div className="w-full">
          <Label className="dark:text-slate-200 mb-2">Description</Label>
          <Editor
            content={task.description}
            onChange={(content) => handleTaskUpdate({ description: content })}
            theme={theme}
            config={{
              placeholder: "Start writing...",
              autofocus: false,
            }}
          />
        </div>

        {/* Task Labels */}
        <div>
          <LabelEditor labels={task.labels} onChange={handleLabelsChange} />
        </div>

        <Separator
          className={cn(
            "my-6",
            theme === "dark" ? "bg-slate-700" : "bg-[#d9d9d9]",
          )}
        />

        {/* Task Properties Tabs */}
        <Tabs defaultValue="properties">
          <TabsList
            className={cn(
              "bg-transparent",
              theme === "dark" ? "border-slate-700" : "border-[#d9d9d9]",
            )}
          >
            <TabsTrigger
              value="properties"
              className={cn(
                theme === "dark"
                  ? "bg-slate-700 text-[#8B5CF6] data-[state=active]:bg-slate-700"
                  : "bg-[#efefef] text-[#5036b0] data-[state=active]:bg-[#efefef]",
              )}
            >
              Properties
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className={cn(
                theme === "dark"
                  ? "text-slate-300 data-[state=active]:bg-slate-700"
                  : "text-[#6f6f6f] data-[state=active]:bg-[#efefef]",
              )}
            >
              Comments
            </TabsTrigger>
            <TabsTrigger
              value="content"
              className={cn(
                theme === "dark"
                  ? "text-slate-300 data-[state=active]:bg-slate-700"
                  : "text-[#6f6f6f] data-[state=active]:bg-[#efefef]",
              )}
            >
              Content
            </TabsTrigger>
            <TabsTrigger
              value="visibility"
              className={cn(
                theme === "dark"
                  ? "text-slate-300 data-[state=active]:bg-slate-700"
                  : "text-[#6f6f6f] data-[state=active]:bg-[#efefef]",
              )}
            >
              Visibility
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className={cn(
                theme === "dark"
                  ? "text-slate-300 data-[state=active]:bg-slate-700"
                  : "text-[#6f6f6f] data-[state=active]:bg-[#efefef]",
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
                options={["Me", "Maria Smith", "John Doe"]}
                onChange={(value) => handleTaskUpdate({ assignee: value })}
              />

              <EditableProperty
                label="List"
                value={task.listId || ""}
                options={availableLists}
                onChange={(value) => handleTaskUpdate({ listId: value })}
                disabled={availableLists.length === 0}
              />

              <EditableProperty
                label="Priority"
                value={
                  task.priority?.charAt(0).toUpperCase() +
                    task.priority?.slice(1) || "Medium"
                }
                icon={<div className="text-red-500 text-lg">●</div>}
                options={["High", "Medium", "Low"]}
                onChange={(value) =>
                  handleTaskUpdate({
                    priority: value.toLowerCase() as Task["priority"],
                  })
                }
              />

              <EditableProperty
                label="Energy"
                value={
                  task.energy?.charAt(0).toUpperCase() +
                    task.energy?.slice(1) || "Medium"
                }
                icon={<div className="text-yellow-500 text-lg">●</div>}
                options={["High", "Medium", "Low"]}
                onChange={(value) =>
                  handleTaskUpdate({
                    energy: value.toLowerCase() as Task["energy"],
                  })
                }
              />

              <EditableProperty
                label="Location"
                value={task.location || "None"}
                options={["Home", "Office", "Outside"]}
                onChange={(value) => handleTaskUpdate({ location: value })}
              />

              <EditableProperty
                label="Story"
                value={task.story || "None"}
                options={["Brazil Vacation", "Home Renovation", "Career Goals"]}
                onChange={(value) => handleTaskUpdate({ story: value })}
              />
            </div>

            <div
              className={cn(
                "mt-16 text-base",
                theme === "dark" ? "text-slate-400" : "text-[#6f6f6f]",
              )}
            >
              Created {new Date(task.createdAt).toLocaleString()}
              <br />
              Updated {new Date(task.updatedAt).toLocaleString()}
            </div>
          </TabsContent>

          <TabsContent value="visibility" className="mt-6">
            <div className="grid grid-cols-1 gap-y-4">
              <div>
                <Label
                  className={cn(
                    "inline-flex items-center space-x-2",
                    theme === "dark" ? "text-slate-200" : "text-gray-700",
                  )}
                >
                  <Checkbox
                    checked={task.showInTimeBox}
                    onCheckedChange={(checked) =>
                      handleTaskUpdate({ showInTimeBox: checked === true })
                    }
                    className="dark:border-slate-600"
                  />
                  <span>Show in Time Box</span>
                </Label>
              </div>
              <div>
                <Label
                  className={cn(
                    "inline-flex items-center space-x-2",
                    theme === "dark" ? "text-slate-200" : "text-gray-700",
                  )}
                >
                  <Checkbox
                    checked={task.showInList}
                    onCheckedChange={(checked) =>
                      handleTaskUpdate({ showInList: checked === true })
                    }
                    className="dark:border-slate-600"
                  />
                  <span>Show in List</span>
                </Label>
              </div>
              <div>
                <Label
                  className={cn(
                    "inline-flex items-center space-x-2",
                    theme === "dark" ? "text-slate-200" : "text-gray-700",
                  )}
                >
                  <Checkbox
                    checked={task.showInCalendar}
                    onCheckedChange={(checked) =>
                      handleTaskUpdate({ showInCalendar: checked === true })
                    }
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

      <TaskScheduler
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        schedule={task?.schedule || null}
        onChange={handleScheduleChange}
      />
    </Sheet>
  );
};
