import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { PropertySheet } from "../../components/PropertySheet";
import { InlineTaskEditor } from "../../components/InlineTaskEditor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Search,
  Bell,
  MoreHorizontal,
  Plus,
  ListIcon,
  InfoIcon,
  Edit,
  Trash2,
} from "lucide-react";
import { Task } from "../../types/task";
import { loadTasks, saveTasks, deleteTask } from "../../utils/storage";
import { cn } from "../../lib/utils";
import { Theme } from "../../utils/theme";
import { TaskHoverCard } from "../../components/TaskHoverCard";
import { createNewTask } from "../../utils/taskUtils";

interface TaskListProps {
  theme?: Theme;
  isAddListOpen?: boolean;
  setIsAddListOpen?: (open: boolean) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  theme = "light",
  isAddListOpen,
  setIsAddListOpen,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [newTaskList, setNewTaskList] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeList, setActiveList] = useState<string | null>(null);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  useEffect(() => {
    const loadTaskData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const loadedTasks = await loadTasks();
        console.log("Loaded tasks:", loadedTasks);
        setTasks(loadedTasks.filter((task) => task.showInList));
      } catch (err) {
        console.error("Error loading tasks:", err);
        setError("Failed to load tasks. Please try again.");
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTaskData();
  }, []);

  const tasksByList = tasks.reduce((acc, task) => {
    if (!acc[task.list]) {
      acc[task.list] = [];
    }
    acc[task.list].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const availableLists = Object.keys(tasksByList);

  const handleTaskComplete = async (taskId: string) => {
    try {
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, timeStage: "done" } : task,
      );
      await saveTasks(updatedTasks);
      setTasks(updatedTasks.filter((task) => task.showInList));
    } catch (error) {
      console.error("Error completing task:", error);
    }
  };

  const handleTaskSelect = (task: Task) => {
    if (editingTaskId !== task.id) {
      setSelectedTask(task);
      setEditingTaskId(null);
    }
  };

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      const newTasks = tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      );
      await saveTasks(newTasks);
      setTasks(newTasks.filter((task) => task.showInList));
      setSelectedTask(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleTaskTitleUpdate = async (taskId: string, title: string) => {
    console.log("Updating task title:", { taskId, title });
    try {
      const updatedTasks = tasks.map((task) =>
        task.id === taskId
          ? { ...task, title, updatedAt: new Date().toISOString() }
          : task,
      );
      await saveTasks(updatedTasks);
      setTasks(updatedTasks);
      setEditingTaskId(null);
    } catch (error) {
      console.error("Error updating task title:", error);
    }
  };

  const handleNewTask = async (list: string) => {
    console.log("Creating new task for list:", list);
    try {
      const newTask = await createNewTask(list);
      console.log("New task created:", newTask);
      const updatedTasks = [newTask, ...tasks];
      await saveTasks(updatedTasks);
      setTasks(updatedTasks);
      setNewTaskList(list);
      setEditingTaskId(newTask.id);
      setNewTaskTitle("");
      setActiveList(list);
    } catch (error) {
      console.error("Error creating new task:", error);
    }
  };

  const handleNewTaskSave = async (taskId: string, title: string) => {
    console.log("Saving new task:", { taskId, title });
    try {
      const trimmedTitle = title.trim();
      if (trimmedTitle) {
        await handleTaskTitleUpdate(taskId, trimmedTitle);
      } else {
        const updatedTasks = tasks.filter((task) => task.id !== taskId);
        await deleteTask(taskId);
        setTasks(updatedTasks);
      }
      setEditingTaskId(null);
      setNewTaskList(null);
      setNewTaskTitle("");
    } catch (error) {
      console.error("Error saving new task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      await deleteTask(taskId);
      setTasks(updatedTasks);
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEditTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setEditingTaskId(taskId);
      setNewTaskTitle(task.title);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 px-6 py-4 overflow-auto">
          <div className="grid grid-cols-3 gap-6">
            {Object.entries(tasksByList).map(([list, tasks]) => (
              <div
                key={list}
                className="space-y-4"
                onClick={() => setActiveList(list)}
              >
                <div className="flex items-center border-b pb-4 dark:border-slate-700">
                  <div
                    className="flex items-center flex-1 cursor-pointer"
                    onClick={() => setActiveList(list)}
                  >
                    <h2
                      className={cn(
                        "text-lg font-semibold capitalize",
                        list === activeList
                          ? theme === "dark"
                            ? "text-[#8B5CF6]"
                            : "text-[#5036b0]"
                          : theme === "dark"
                          ? "text-gray-200"
                          : "text-gray-800",
                      )}
                    >
                      {list}
                    </h2>
                    <Badge
                      className={cn(
                        "ml-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
                      )}
                    >
                      {tasks.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-8 w-8"
                    onClick={() => handleNewTask(list)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {/* {newTaskList === list && editingTaskId && (
                    <div
                      className={cn(
                        "flex items-start space-x-2 p-2 rounded-lg",
                        "bg-gray-50 dark:bg-gray-800"
                      )}
                    >
                      <Checkbox
                        checked={false}
                        className="mt-1"
                        disabled
                      />
                      <InlineTaskEditor
                        value={newTaskTitle}
                        onChange={setNewTaskTitle}
                        onSave={() => handleNewTaskSave(editingTaskId, newTaskTitle)}
                        onCancel={() => {
                          setEditingTaskId(null);
                          setNewTaskList(null);
                          setNewTaskTitle('');
                        }}
                        className="flex-1"
                      />
                    </div>
                  )} */}
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-start space-x-2 p-2 rounded-lg group",
                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                        "cursor-pointer",
                      )}
                      onClick={() => handleTaskSelect(task)}
                      onDoubleClick={() => {
                        setEditingTaskId(task.id);
                        setNewTaskTitle(task.title);
                      }}
                      onMouseEnter={() => setHoveredTaskId(task.id)}
                      onMouseLeave={() => setHoveredTaskId(null)}
                    >
                      <Checkbox
                        checked={task.timeStage === "done"}
                        onCheckedChange={() => handleTaskComplete(task.id)}
                        className="mt-1"
                        onClick={(e) => e.stopPropagation()}
                      />
                      {editingTaskId === task.id ? (
                        <InlineTaskEditor
                          value={newTaskTitle}
                          onChange={setNewTaskTitle}
                          onSave={() =>
                            handleNewTaskSave(task.id, newTaskTitle)
                          }
                          onCancel={() => {
                            setEditingTaskId(null);
                            setNewTaskTitle("");
                          }}
                          className="flex-1"
                        />
                      ) : (
                        <>
                          <span
                            className={cn(
                              "flex-1",
                              theme === "dark"
                                ? "text-gray-200"
                                : "text-gray-700",
                              task.timeStage === "done" &&
                                "line-through opacity-50",
                            )}
                          >
                            {task.title}
                          </span>
                          <div
                            className={cn(
                              "flex items-center gap-2",
                              hoveredTaskId === task.id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          >
                            <TaskHoverCard task={task}>
                              <InfoIcon
                                size={16}
                                className="text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </TaskHoverCard>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal
                                    size={16}
                                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                  />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditTask(task.id);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 dark:text-red-400"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTask(task.id);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedTask && (
        <div
          className={cn(
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
            availableLists={availableLists}
          />
        </div>
      )}
    </div>
  );
};
