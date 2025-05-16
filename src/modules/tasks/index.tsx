import React, { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent } from "../../components/ui/tabs";
import { Sidebar } from "../../components/Sidebar";
import { TasksHeader } from "../../components/TasksHeader";
import { FilterHeader } from "../../components/FilterHeader";
import { FilterPanel } from "../../components/FilterPanel";
import { PropertySheet } from "../../components/PropertySheet";
import { PtbTimeBox } from "./timebox";
import { TaskList } from "./lists/TaskList";
import CalendarView from "./calendar";
import {
  Theme,
  getInitialTheme,
  setTheme as setThemeUtil,
} from "../../utils/theme";
import { cn } from "../../lib/utils";
import { Filter, ListIcon, CalendarIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { Task } from "../../types/task";
import ToggleButton from "../../components/ui/toggle";
import { useLists } from "../../hooks/useLists";
import useStories from "../../hooks/useStories";
import { TaskProvider } from "../../contexts/TaskContext";
import { useTasks } from "../../contexts/TaskContext";
import { useFetchTimeBoxes } from "../../hooks/timeBoxHooks";

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
    isLoadingTasks: tasksLoading,
    tasksError: tasksErrorContext,
    getTaskById,
    updateTaskMutation,
  } = useTasks();
  const {
    data: timeBoxes = [],
    isLoading: isLoadingTimeBoxes,
    error: timeBoxesError,
  } = useFetchTimeBoxes();
  const { lists, setLists } = useLists();
  const { stories } = useStories("todo");

  const [selectedTaskForSheet, setSelectedTaskForSheet] = useState<Task | null>(
    null,
  );

  const isLoading = tasksLoading || isLoadingTimeBoxes;
  const error = tasksErrorContext || timeBoxesError;

  const sortedTimeBoxesWithTasks = useMemo(() => {
    if (!timeBoxes?.length || !tasks?.length) {
      return [];
    }

    const result = timeBoxes
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((timeBox) => ({
        ...timeBox,
        tasks: tasks.filter(
          (task) => task.timeStage === timeBox.id && task.showInTimeBox,
        ),
      }));

    return result;
  }, [timeBoxes, tasks]);

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
    updateTaskMutation.mutate(
      { taskId: updatedTask.id, updates: updatedTask },
      {
        onSuccess: (result) => {
          if (result) {
            if (selectedTaskForSheet && selectedTaskForSheet.id === result.id) {
              setSelectedTaskForSheet(result);
            }
          } else {
            toast.error("Failed to update task: No result from mutation");
          }
        },
        onError: (error) => {
          toast.error(`Failed to update task: ${error.message}`);
        },
      },
    );
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500"></div>
        <p className="ml-4 text-lg">Loading data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 p-4 bg-red-100 border border-red-400 rounded">
          Error loading data: {error.message}
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
        onValueChange={(value) => {
          setActiveTab(value as ActiveTab);
        }}
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
              onChange={(value) => {
                setActiveTab(value as ActiveTab);
                setSelectedLocalTaskId(null);
                setSelectedTaskForSheet(null);
                setActivePanel(null);
              }}
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
                sortedTimeBoxesWithTasks={sortedTimeBoxesWithTasks}
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
