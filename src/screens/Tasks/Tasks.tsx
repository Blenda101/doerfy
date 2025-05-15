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
import { TaskProvider } from "../../contexts/TaskContext";
import { useTaskContext } from "../../hooks/useTaskContext";

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

const TasksComponent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    () =>
      (localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB) as ActiveTab) || "timebox",
  );
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [isAddListOpen, setIsAddListOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);
  const [selectedLocalTaskId, setSelectedLocalTaskId] = useState<string | null>(
    () => localStorage.getItem(STORAGE_KEYS.SELECTED_TASK),
  );

  const {
    tasks,
    isLoading: tasksLoading,
    error: tasksError,
    getTaskById,
    updateTask: updateTaskContext,
  } = useTaskContext();

  const { lists, setLists } = useLists();
  const { stories } = useStories("todo");

  const [selectedTaskForSheet, setSelectedTaskForSheet] = useState<Task | null>(
    null,
  );

  useEffect(() => {
    setThemeUtil(theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (selectedLocalTaskId) {
      localStorage.setItem(STORAGE_KEYS.SELECTED_TASK, selectedLocalTaskId);
      const task = getTaskById(selectedLocalTaskId);
      setSelectedTaskForSheet(task || null);
      if (task) setActivePanel("property");
      else setActivePanel(null);
    } else {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_TASK);
      setSelectedTaskForSheet(null);
    }
  }, [selectedLocalTaskId, getTaskById, tasks]);

  const handlePanelClose = () => {
    setActivePanel(null);
    setSelectedLocalTaskId(null);
  };

  const handleFilterClick = () => {
    setActivePanel(activePanel === "filter" ? null : "filter");
    if (activePanel !== "filter") {
      setSelectedLocalTaskId(null);
    }
  };

  const handleTaskSelect = (task: Task) => {
    setSelectedLocalTaskId(task.id);
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    const result = await updateTaskContext(updatedTask.id, updatedTask);
    if (result) {
      if (selectedTaskForSheet && selectedTaskForSheet.id === result.id) {
        setSelectedTaskForSheet(result);
      }
      toast.success("Task updated successfully via context");
    } else {
      toast.error("Failed to update task via context");
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

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 p-4 bg-red-100 border border-red-400 rounded">
          Error loading tasks: {tasksError}
        </div>
      </div>
    );
  }

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
            <TabsContent value="timebox" className="flex-1 m-0">
              <PtbTimeBox
                theme={theme}
                onTaskSelect={handleTaskSelect}
                selectedTaskId={selectedLocalTaskId}
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

          {activePanel === "property" && selectedTaskForSheet && (
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
                task={selectedTaskForSheet}
                onClose={handlePanelClose}
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

export const Tasks: React.FC = () => {
  return (
    <TaskProvider>
      <TasksComponent />
    </TaskProvider>
  );
};
