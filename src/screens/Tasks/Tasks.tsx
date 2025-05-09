import React, { useState, useEffect } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { Sidebar } from "../../components/Sidebar";
import { TasksHeader } from "../../components/TasksHeader";
import { FilterHeader } from "../../components/FilterHeader";
import { FilterPanel } from "../../components/FilterPanel";
import { PropertySheet } from "../../components/PropertySheet";
import { PtbTimeBox } from "../PtbTimeBox/PtbTimeBox";
import { TaskList } from "../TaskList/TaskList";
import { Calendar } from "../Calendar/Calendar";
import { AddListDialog } from "../../components/AddListDialog";
import {
  Theme,
  getInitialTheme,
  setTheme as setThemeUtil,
} from "../../utils/theme";
import { useFilterStore } from "../../store/filterStore";
import { supabase } from "../../utils/supabaseClient";
import { cn } from "../../lib/utils";
import { Filter, ListIcon, CalendarIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { Task } from "../../types/task";
import ToggleButton from "../../components/ui/toggle";
import { useLists } from "../../hooks/useLists";
import useStories from "../../hooks/useStories";

// Constants for local storage keys
const STORAGE_KEYS = {
  ACTIVE_TAB: "activeTaskTab",
  SELECTED_TASK: "selectedTaskId",
};

// Types for component state
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
  // State Management
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { filterTasks } = useFilterStore();
  const { lists, setLists } = useLists();
  const { stories, setStories } = useStories();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Theme Management
  useEffect(() => {
    setThemeUtil(theme);
  }, [theme]);

  // Persist active tab to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

  // Persist selected task to localStorage
  useEffect(() => {
    if (selectedTaskId) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_TASK, selectedTaskId);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_TASK);
    }
  }, [selectedTaskId]);

  // Fetch tasks from Supabase
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("No authenticated user found");

        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("assignee", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Transform tasks to match our frontend model
        const transformedTasks =
          data?.map((task) => ({
            ...task,
            showInTimeBox: task.show_in_time_box,
            showInList: task.show_in_list,
            showInCalendar: task.show_in_calendar,
            timeStage: task.timestage,
            agingStatus: task.aging_status,
            stageEntryDate: task.stage_entry_date,
            createdAt: task.created_at,
            updatedAt: task.updated_at,
            createdBy: task.created_by,
          })) || [];

        setTasks(transformedTasks);

        // Clear selected task if it no longer exists
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

  // Event Handlers
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

  const handleTaskSelect = (taskId: string) => {
    if (activePanel === "property" && selectedTaskId === taskId) {
      setActivePanel(null);
      setSelectedTaskId(null);
    } else {
      setActivePanel("property");
      setSelectedTaskId(taskId);
    }
  };

  // Task Update Handler
  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      setIsLoading(true);

      // Update task in Supabase
      const { error } = await supabase
        .from("tasks")
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          timestage: updatedTask.timeStage,
          stage_entry_date: updatedTask.stageEntryDate,
          assignee: updatedTask.assignee,
          list_id: updatedTask.list_id,
          priority: updatedTask.priority,
          energy: updatedTask.energy,
          location: updatedTask.location,
          story: updatedTask.story,
          labels: updatedTask.labels,
          icon: updatedTask.icon,
          show_in_time_box: updatedTask.showInTimeBox,
          show_in_list: updatedTask.showInList,
          show_in_calendar: updatedTask.showInCalendar,
          highlighted: updatedTask.highlighted,
          status: updatedTask.status,
          aging_status: updatedTask.agingStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedTask.id);

      if (error) throw error;

      // Refresh tasks after update
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

      const transformedTasks =
        refreshedTasks?.map((task) => ({
          ...task,
          showInTimeBox: task.show_in_time_box,
          showInList: task.show_in_list,
          showInCalendar: task.show_in_calendar,
          timeStage: task.timestage,
          agingStatus: task.aging_status,
          stageEntryDate: task.stage_entry_date,
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          createdBy: task.created_by,
        })) || [];

      setTasks(transformedTasks);
      toast.success("Task updated successfully");
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Error updating task");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get header props based on active tab
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
      {/* Sidebar */}
      <Sidebar
        isSidebarExpanded={isSidebarExpanded}
        theme={theme}
        onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        onToggleTheme={() =>
          setTheme((current) => (current === "dark" ? "light" : "dark"))
        }
      />

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ActiveTab)}
        className="flex-1 flex flex-col h-full"
      >
        {/* Header */}
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
                  icon: (
                    <Filter className="text-theme-light dark:text-theme-dark" />
                  ),
                },
                {
                  value: "lists",
                  label: "Lists",
                  icon: (
                    <ListIcon className="text-theme-light dark:text-theme-dark" />
                  ),
                },
                {
                  value: "calendar",
                  label: "Calendar",
                  icon: (
                    <CalendarIcon className="text-theme-light dark:text-theme-dark" />
                  ),
                },
              ]}
              activeOption={activeTab}
              onChange={setActiveTab as (value: string) => void}
            />
          }
          onFilterClick={handleFilterClick}
        />

        {/* Filter Header */}
        <FilterHeader theme={theme} view={activeTab} />

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
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
                    onTaskSelect={(taskId) =>
                      setSelectedTask(
                        tasks.find((t) => t.id === taskId) || null,
                      )
                    }
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
                    onTaskSelect={(task) => setSelectedTask(task)}
                  />
                </TabsContent>
                <TabsContent value="calendar" className="flex-1 m-0">
                  <Calendar
                    theme={theme}
                    onTaskSelect={(task) => setSelectedTask(task)}
                  />
                </TabsContent>
              </>
            )}
          </div>

          {/* Side Panels */}
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

          {selectedTask && (
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
