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

const STORAGE_KEYS = {
  ACTIVE_TAB: "activeTaskTab",
  SELECTED_TASK: "selectedTaskId",
};

export const Tasks: React.FC = () => {
  const [activeTab, setActiveTab] = useState(
    () => localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) || "timebox",
  );
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [isAddListOpen, setIsAddListOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<"filter" | "property" | null>(
    null,
  );
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEYS.SELECTED_TASK),
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { filterTasks } = useFilterStore();

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

        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("assignee", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

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

  const handleTaskSelect = (taskId: string) => {
    if (activePanel === "property" && selectedTaskId === taskId) {
      setActivePanel(null);
      setSelectedTaskId(null);
    } else {
      setActivePanel("property");
      setSelectedTaskId(taskId);
    }
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("tasks")
        .update({
          title: updatedTask.title,
          description: updatedTask.description,
          timestage: updatedTask.timeStage,
          stage_entry_date: updatedTask.stageEntryDate,
          assignee: updatedTask.assignee,
          list: updatedTask.list,
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

  const getHeaderProps = () => {
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

  const filteredTasks = filterTasks(
    tasks,
    activeTab as "timebox" | "lists" | "calendar",
  );
  const selectedTask = tasks.find((t) => t.id === selectedTaskId);

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
        onValueChange={setActiveTab}
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
              onChange={(value) =>
                setActiveTab(value as "timebox" | "lists" | "calendar")
              }
            />
          }
          onFilterClick={handleFilterClick}
        />
        <FilterHeader
          theme={theme}
          view={activeTab as "timebox" | "lists" | "calendar"}
        />
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
                    onTaskSelect={handleTaskSelect}
                    selectedTaskId={selectedTaskId}
                    onTaskUpdate={handleTaskUpdate}
                  />
                </TabsContent>
                <TabsContent value="lists" className="flex-1 m-0">
                  <TaskList
                    theme={theme}
                    isAddListOpen={isAddListOpen}
                    setIsAddListOpen={setIsAddListOpen}
                  />
                </TabsContent>
                <TabsContent value="calendar" className="flex-1 m-0">
                  <Calendar
                    theme={theme}
                    tasks={filteredTasks}
                    onTaskSelect={handleTaskSelect}
                    selectedTaskId={selectedTaskId}
                  />
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
                view={activeTab as "timebox" | "lists" | "calendar"}
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
                onClose={handlePanelClose}
                onTaskUpdate={handleTaskUpdate}
                theme={theme}
                availableLists={Array.from(new Set(tasks.map((t) => t.list)))}
              />
            </div>
          )}
        </div>
      </Tabs>

      <AddListDialog
        isOpen={isAddListOpen}
        onClose={() => setIsAddListOpen(false)}
        onSave={(config) => {
          setIsAddListOpen(false);
        }}
      />
    </div>
  );
};
