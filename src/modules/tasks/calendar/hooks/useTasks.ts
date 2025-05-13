import { useState, useEffect } from "react";
import { Task, TaskSchedule, TaskSchema } from "../../../../types/task";
import { loadTasks, saveTasks } from "../../../../utils/storage";
import { createNewTask } from "../../../../utils/taskUtils";

interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  error: Error | null;
  updateTask: (updatedTask: Task) => Promise<void>;
  createTask: (properties: Partial<TaskSchema>) => Promise<Task>;
  moveTask: (taskId: string, newDate: Date) => Promise<void>;
}

/**
 * Custom hook for managing tasks in the calendar
 * Handles loading, updating, creating, and moving tasks
 */
export const useTasks = (): UseTasksReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        const loadedTasks = await loadTasks();
        setTasks(loadedTasks.filter((task) => task.showInCalendar));
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to load tasks"),
        );
        console.error("Error loading tasks:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, []);

  // Update an existing task
  const updateTask = async (updatedTask: Task) => {
    try {
      const updatedTasks = tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      );
      await saveTasks(updatedTasks);
      setTasks(updatedTasks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to update task"));
      console.error("Error updating task:", err);
      throw err;
    }
  };

  // Create a new task
  const createTask = async (properties: Partial<TaskSchema>): Promise<Task> => {
    try {
      const task = await createNewTask(
        properties.title,
        undefined,
        undefined,
        properties,
      );
      const schedule: TaskSchedule = {
        enabled: true,
        date: properties.schedule_date
          ? new Date(properties.schedule_date)
          : null,
        time: properties.schedule_time || "09:00",
        leadDays: properties.duration_days || 0,
        leadHours: properties.duration_hours || 0,
      };
      task.schedule = schedule;

      const updatedTasks = [task, ...tasks];
      setTasks(updatedTasks);
      setError(null);
      return task;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to create task"));
      console.error("Error creating task:", err);
      throw err;
    }
  };

  // Move a task to a new date
  const moveTask = async (taskId: string, newDate: Date) => {
    try {
      const taskToMove = tasks.find((task) => task.id === taskId);
      if (!taskToMove) {
        throw new Error("Task not found");
      }

      const updatedTask: Task = {
        ...taskToMove,
        schedule: {
          ...taskToMove.schedule,
          date: newDate,
          enabled: true,
        } as TaskSchedule,
        updatedAt: new Date().toISOString(),
      };

      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? updatedTask : task,
      );
      await saveTasks(updatedTasks);
      setTasks(updatedTasks);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to move task"));
      console.error("Error moving task:", err);
      throw err;
    }
  };

  return {
    tasks,
    isLoading,
    error,
    updateTask,
    createTask,
    moveTask,
  };
};
