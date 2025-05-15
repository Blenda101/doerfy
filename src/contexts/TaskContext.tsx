import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { supabase } from "../utils/supabaseClient";
import {
  AgingStatus,
  Task,
  TaskFromSupabase,
  TaskSchedule,
} from "../types/task";
import { toast } from "react-hot-toast";
import { mapTaskFromSupabase, mapTaskToSupabase } from "../utils/taskMapper";
import { getAuthenticatedUser } from "../utils/auth";
import { getTask } from "../utils/task"; // Assuming this is a utility to get a default task structure
import { getDateInterval } from "../modules/tasks/calendar/utils/getDateInterval";

export interface TaskContextState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  fetchTasks: () => Promise<void>;
  createTask: (
    taskData: Partial<
      Omit<Task, "id" | "createdAt" | "updatedAt" | "createdBy" | "assignee">
    >,
    slot?: { start: Date; end: Date },
  ) => Promise<Task | undefined>;
  updateTask: (
    taskId: string,
    updates: Partial<Task>,
  ) => Promise<Task | undefined>;
  deleteTask: (taskId: string) => Promise<void>;
  getTaskById: (taskId: string) => Task | undefined;
  // Add other specific states or setters if needed by multiple components,
  // otherwise, they can remain local to the components.
  // For example, selectedTask could be here if multiple components need to react to it.
}

export const TaskContext = createContext<TaskContextState | undefined>(
  undefined,
);

interface TaskProviderProps {
  children: ReactNode;
}

export const TaskProvider: React.FC<TaskProviderProps> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      const { data, error: fetchError } = await supabase
        .from("tasks")
        .select("*")
        .eq("assignee", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      const transformedTasks: Task[] = data
        ? data.map((task) =>
            mapTaskFromSupabase(task as TaskFromSupabase, user.id),
          )
        : [];
      setTasks(transformedTasks);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load tasks";
      console.error("Error loading tasks:", err);
      setError(errorMessage);
      toast.error("Error loading tasks");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (
    taskData: Partial<
      Omit<Task, "id" | "createdAt" | "updatedAt" | "createdBy" | "assignee">
    >,
    slot?: { start: Date; end: Date },
  ): Promise<Task | undefined> => {
    try {
      setIsLoading(true);
      const user = await getAuthenticatedUser();
      if (!user) throw new Error("User not authenticated");

      let scheduleForTask: TaskSchedule | null = null;
      let showInCalendarDueToSlot = false;
      if (slot) {
        const { schedule_date, schedule_time, duration_days, duration_hours } =
          getDateInterval(slot);
        scheduleForTask = {
          date: new Date(schedule_date),
          time: schedule_time,
          durationDays: duration_days,
          durationHours: duration_hours,
          enabled: true,
        };
        showInCalendarDueToSlot = true;
      }

      const rawBaseTask = getTask({
        assignee: user.id,
        created_by: user.id,
        title: taskData.title || "New Task",
      });

      const fullTaskData: Task = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        highlighted: false,
        icon: "",
        createdBy: user.id,
        assignee: user.id,
        title: taskData.title || rawBaseTask.title || "New Task",
        description: taskData.description || rawBaseTask.description || "",
        priority:
          taskData.priority ||
          (rawBaseTask.priority as Task["priority"]) ||
          "medium",
        timeStage:
          taskData.timeStage ||
          (rawBaseTask.timestage as Task["timeStage"]) ||
          null,
        stageEntryDate: taskData.stageEntryDate || rawBaseTask.stage_entry_date,
        story: taskData.story || rawBaseTask.story_id || null,
        listId: taskData.listId || rawBaseTask.list_id || null,
        labels: taskData.labels || rawBaseTask.labels || [],
        energy:
          taskData.energy || (rawBaseTask.energy as Task["energy"]) || null,
        location: taskData.location || rawBaseTask.location || null,
        schedule:
          taskData.schedule !== undefined ? taskData.schedule : scheduleForTask,
        showInTimeBox:
          taskData.showInTimeBox ??
          (taskData.timeStage ? true : rawBaseTask.show_in_time_box ?? false),
        showInList:
          taskData.showInList ??
          (taskData.listId ? true : rawBaseTask.show_in_list ?? false),
        showInCalendar:
          taskData.showInCalendar ??
          showInCalendarDueToSlot ??
          rawBaseTask.show_in_calendar ??
          false,
        agingStatus:
          taskData.agingStatus || (rawBaseTask.aging_status as AgingStatus),
        checklistItems: taskData.checklistItems || [],
        comments: taskData.comments || [],
        attachments: taskData.attachments || [],
        history: taskData.history || [],
      };

      const supabaseTask = mapTaskToSupabase(fullTaskData);

      const { data, error: insertError } = await supabase
        .from("tasks")
        .insert(supabaseTask)
        .select()
        .single();

      if (insertError) throw insertError;

      const newTask = mapTaskFromSupabase(data as TaskFromSupabase, user.id);
      setTasks((prevTasks) => [newTask, ...prevTasks]);
      toast.success("Task created successfully");
      return newTask;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create task";
      console.error("Error creating task:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (
    taskId: string,
    updates: Partial<Task>,
  ): Promise<Task | undefined> => {
    try {
      setIsLoading(true);
      const taskToUpdate = tasks.find((t) => t.id === taskId);
      if (!taskToUpdate) throw new Error("Task not found for update");

      const updatedTaskData = {
        ...taskToUpdate,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      const supabaseTask = mapTaskToSupabase(updatedTaskData);

      // Remove id from the supabaseTask object for update, as Supabase might not allow updating primary key.
      // Supabase typically uses `eq('id', taskId)` for targeting the row.
      const { id, ...updatePayload } = supabaseTask;

      const { data, error: updateError } = await supabase
        .from("tasks")
        .update(updatePayload)
        .eq("id", taskId)
        .select()
        .single();

      if (updateError) throw updateError;

      const user = await getAuthenticatedUser();
      if (!user) throw new Error("User not authenticated");

      const refreshedTask = mapTaskFromSupabase(
        data as TaskFromSupabase,
        user.id,
      );
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? refreshedTask : task)),
      );
      toast.success("Task updated successfully");
      return refreshedTask;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update task";
      console.error("Error updating task:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    try {
      setIsLoading(true);
      const { error: deleteError } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);

      if (deleteError) throw deleteError;

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      toast.success("Task deleted successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete task";
      console.error("Error deleting task:", err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getTaskById = (taskId: string): Task | undefined => {
    return tasks.find((task) => task.id === taskId);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        error,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        getTaskById,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
