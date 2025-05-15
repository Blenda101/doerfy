import React, { useState, useEffect } from "react";
import { Tabs, TabsContent } from "../../components/ui/tabs";
import { Sidebar } from "../../components/Sidebar";
import { TasksHeader } from "../../components/TasksHeader";
import { FilterHeader } from "../../components/FilterHeader";
import { FilterPanel } from "../../components/FilterPanel";
import { PropertySheet } from "../../components/PropertySheet";
import { PtbTimeBox } from "../PtbTimeBox/PtbTimeBox";
import { TaskList } from "../TaskList/TaskList";
import CalendarView from "../../modules/tasks/calendar";
import {
  Theme,
  getInitialTheme,
  setTheme as setThemeUtil,
} from "../../utils/theme";
import { supabase } from "../../utils/supabaseClient";
import { cn } from "../../lib/utils";
import { Filter, ListIcon, CalendarIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { Task, TaskFromSupabase } from "../../types/task";
import ToggleButton from "../../components/ui/toggle";
import { useLists } from "../../hooks/useLists";
import useStories from "../../hooks/useStories";
import { mapTaskFromSupabase, mapTaskToSupabase } from "../../utils/taskMapper";

const STORAGE_KEYS = {
  ACTIVE_TAB: "activeTaskTab",
  SELECTED_TASK: "selectedTaskId",
};

type ActiveTab = "timebox" | "lists" | "calendar";
type ActivePanel = "filter" | "property" | null;
type HeaderProps = {
  title: string;
  icon: React.ReactNode;
  addItemLabel: string;
  isAddListOpen?: boolean;
  setIsAddListOpen?: (value: boolean) => void;
};

export const Tasks: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    () =>
      (localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) as ActiveTab) || "timebox",
  );
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [isAddListOpen, setIsAddListOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEYS.SELECTED_TASK),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { lists, setLists } = useLists();
  const { stories } = useStories("todo");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    setThemeUtil(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (selectedTaskId) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_TASK, selectedTaskId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_TASK);
    }
  }, [selectedTaskId]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No authenticated user found");
        const { data, error } = (await supabase
          .from("tasks")
          .select("*")
          .eq("assignee", user.id)
          .order("created_at", { ascending: false })) as {
          data: TaskFromSupabase[] | null;
          error: Error | null;
        };

        if (error) throw error;

        const transformedTasks: Task[] = data
          ? data.map((task) => mapTaskFromSupabase(task, user.id))
          : [];

        setTasks(transformedTasks);

        if (
          selectedTaskId &&
          !transformedTasks?.find((t) => t.id === selectedTaskId)
        ) {
          setSelectedTaskId(null);
          setActivePanel(null);
        }
      } catch (error) {
        console.error("Error loading tasks:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load tasks",
        );
        toast.error("Error loading tasks");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [selectedTaskId]);

  const handlePanelClose = () => {
    setActivePanel(null);
    setSelectedTaskId(null);
  };

  const handleFilterClick = () => {
    setActivePanel(activePanel === "filter" ? null : "filter");
    if (selectedTaskId) {
      setSelectedTaskId(null);
    }
  };

  const handleTaskSelect = (task: Task) => {
    setActivePanel("property");
    setSelectedTask(task);
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      setIsLoading(true);

      const supabaseTask = mapTaskToSupabase(updatedTask);
      console.log({ supabaseTask });
      const { error } = await supabase
        .from("tasks")
        .update(supabaseTask)
        .eq("id", updatedTask.id);

      if (error) throw error;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      const { data: refreshedTasks, error: refreshError } = await supabase
        .from("tasks")
        .select("*")
        .eq("assignee", user.id)
        .order("created_at", { ascending: false });

      if (refreshError) throw refreshError;

      const transformedTasks: Task[] =
        refreshedTasks?.map((task) => mapTaskFromSupabase(task, user.id)) || [];

      setTasks(transformedTasks);
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Error updating task");
    } finally {
      setIsLoading(false);
    }
  };

  const getHeaderProps = (): HeaderProps => {
    switch (activeTab) {
      case "timebox":
        return {
          title: "Time Box",
          icon: <Filter />,
          addItemLabel: "Add Time Box",
        };
      case "lists":
        return {
          title: "Lists",
          icon: <ListIcon />,
          addItemLabel: "Add List",
          isAddListOpen,
          setIsAddListOpen,
        };
      case "calendar":
        return {
          title: "Calendar",
          icon: <CalendarIcon />,
          addItemLabel: "Add Event",
        };
      default:
        return { title: "Tasks", icon: <Filter />, addItemLabel: "Add Task" };
    }
  };

  return (
    <div
      className={cn(
        "flex h-screen",
        theme === "dark" ? "dark bg-[#0F172A]" : "bg-white",
      )}
    >
      <Sidebar
        isSidebarExpanded={isSidebarExpanded}
        theme={theme}
        onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        onToggleTheme={() =>
          setTheme((current) => (current === "dark" ? "light" : "dark"))
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ActiveTab)}
        className="flex-1 flex flex-col h-full"
      >
        <TasksHeader
          {...getHeaderProps()}
          theme={theme}
          tabs={
            <ToggleButton
              size={24}
              options={[
                {
                  value: "timebox",
                  label: "Time",
                  icon: <Filter />,
                },
                {
                  value: "lists",
                  label: "Lists",
                  icon: <ListIcon />,
                },
                {
                  value: "calendar",
                  label: "Calendar",
                  icon: <CalendarIcon />,
                },
              ]}
              activeOption={activeTab}
              onChange={setActiveTab as (value: string) => void}
            />
          }
          onFilterClick={handleFilterClick}
        />

        <FilterHeader theme={theme} view={activeTab} />

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : (
              <>
                <TabsContent value="timebox" className="flex-1 m-0">
                  <PtbTimeBox
                    theme={theme}
                    tasks={tasks}
                    setTasks={setTasks}
                    onTaskSelect={handleTaskSelect}
                    selectedTaskId={selectedTask?.id}
                    onTaskUpdate={handleTaskUpdate}
                  />
                </TabsContent>
                <TabsContent value="lists" className="flex-1 m-0">
                  <TaskList
                    theme={theme}
                    isAddListOpen={isAddListOpen}
                    setIsAddListOpen={setIsAddListOpen}
                    lists={lists}
                    setLists={setLists}
                    onTaskSelect={handleTaskSelect}
                  />
                </TabsContent>
                <TabsContent value="calendar" className="flex-1 m-0">
                  <CalendarView theme={theme} onTaskSelect={handleTaskSelect} />
                </TabsContent>
              </>
            )}
          </div>

          {activePanel === "filter" && (
            <div
              className={cn(
                "w-[400px] transition-transform duration-300 ease-in-out transform",
                "border-l",
                theme === "dark" ? "border-[#334155]" : "border-gray-200",
              )}
            >
              <FilterPanel
                onClose={handlePanelClose}
                view={activeTab}
                theme={theme}
              />
            </div>
          )}

          {activePanel === "property" && selectedTask && (
            <div
              className={cn(
                "transition-transform duration-300 ease-in-out transform",
                "border-l",
                theme === "dark"
                  ? "border-[#334155] bg-[#1E293B]"
                  : "border-gray-200",
              )}
            >
              <PropertySheet
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onTaskUpdate={handleTaskUpdate}
                theme={theme}
                lists={lists}
                stories={stories}
              />
            </div>
          )}
        </div>
      </Tabs>
    </div>
  );
};
