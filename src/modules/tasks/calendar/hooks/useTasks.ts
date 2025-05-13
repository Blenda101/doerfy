import { useState, useEffect } from "react";
import { Task, TaskSchedule } from "../../../../types/task";
import { loadTasks, saveTasks } from "../../../../utils/storage";
import { getAuthenticatedUser } from "../../../../utils/auth";
import { supabase } from "../../../../utils/supabaseClient";
import { getTask } from "../../../../utils/task";
import { getDateInterval } from "../utils/getDateInterval";
import { mapTaskFromSupabase } from "../../../../utils/taskMapper";
interface UseTasksReturn {
  tasks: Task[];
  isLoading: boolean;
  error: Error | null;
  updateTask: (updatedTask: Task) => Promise<void>;
  createTask: (
    title: string,
    slot: { start: Date; end: Date },
  ) => Promise<Task>;
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
  const createTask = async (
    title: string,
    slot: { start: Date; end: Date },
  ): Promise<Task> => {
    try {
      const user = await getAuthenticatedUser();
      const taskTitle = title.trim() || "New Task";
      const { schedule_date, schedule_time, duration_days, duration_hours } =
        getDateInterval(slot);

      const { data, error } = await supabase
        .from("tasks")
        .insert(
          getTask({
            assignee: user.id,
            created_by: user.id,
            title: taskTitle,
            show_in_calendar: true,
            schedule_date,
            schedule_time,
            duration_days,
            duration_hours,
          }),
        )
        .select()
        .single();

      if (error) {
        throw error;
      }

      const task = mapTaskFromSupabase(data, user.id);

      // const task = await createNewTask(
      //   properties.title,
      //   undefined,
      //   undefined,
      //   properties,
      // );
      // const schedule: TaskSchedule = {
      //   enabled: true,
      //   date: properties.schedule ? new Date(properties.schedule_date) : null,
      //   time: properties.schedule_time || "09:00",
      //   leadDays: properties.duration_days || 0,
      //   leadHours: properties.duration_hours || 0,
      // };
      // task.schedule = schedule;

      const updatedTasks = [task, ...tasks];
      await saveTasks(updatedTasks);
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
