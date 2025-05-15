import React, { useState, useEffect, useCallback } from "react";
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
import debounce from "lodash/debounce";
import {
  StarIcon,
  MoreHorizontalIcon,
  InfoIcon,
  User,
} from "lucide-react";
import { Sheet } from "./Sheet";
import { Editor } from "./forms/Editor";
import { List } from "../hooks/useLists";
import { Story } from "../types/story";
import { Schedule } from "./Schedule";

interface PropertySheetProps {
  task: Task;
  onClose: () => void;
  onTaskUpdate: (updatedTask: Task) => void;
  theme?: Theme;
  lists: List[];
  stories: Story[];
}

export const PropertySheet: React.FC<PropertySheetProps> = ({
  task,
  onClose,
  onTaskUpdate,
  theme = "light",
  lists,
  stories,
}) => {
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  console.log(task);

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

  const debouncedUpdate = useCallback(
    debounce((updatedTask: Task) => {
      onTaskUpdate(updatedTask);
    }, 700),
    [onTaskUpdate],
  );

  const handleTaskUpdate = (updates: Partial<Task>) => {
    if (!task) return;
    const updatedTask = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    debouncedUpdate(updatedTask);
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
      <EditableTitle
        title={task.title}
        onTitleChange={handleTitleChange}
        theme={theme}
      />

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Schedule
            schedule={task.schedule}
            onScheduleChange={handleScheduleChange}
            theme={theme}
          />

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

      <div>
        <LabelEditor labels={task.labels} onChange={handleLabelsChange} />
      </div>

      <Separator
        className={cn(
          "my-6",
          theme === "dark" ? "bg-slate-700" : "bg-[#d9d9d9]",
        )}
      />

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
              value={lists.find((l) => l.id === task.listId)?.name || "None"}
              options={lists.map((list) => ({
                value: list.id,
                label: list.name,
              }))}
              onChange={(value) => handleTaskUpdate({ listId: value })}
              disabled={lists.length === 0}
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
                task.energy?.charAt(0).toUpperCase() + task.energy?.slice(1) ||
                "Medium"
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
              value={stories.find((s) => s.id === task.story)?.title || "None"}
              options={stories.map((story) => ({
                value: story.id,
                label: story.title,
              }))}
              onChange={(value) => handleTaskUpdate({ story: value })}
            />
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
      <div
        className={cn(
          "text-center text-sm",
          theme === "dark" ? "text-slate-400" : "text-[#6f6f6f]",
        )}
      >
        Created {new Date(task.createdAt).toLocaleString()}
        <br />
        Updated {new Date(task.updatedAt).toLocaleString()}
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
