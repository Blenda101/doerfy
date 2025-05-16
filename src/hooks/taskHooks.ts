import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { getTask } from "../utils/task";
import { getDateInterval } from "../modules/tasks/calendar/utils/getDateInterval";

// Query Keys
export const taskKeys = {
  all: ["tasks"] as const,
  detail: (id: string) => [...taskKeys.all, id] as const,
};

export interface CreateTaskVariables {
  taskData: Partial<
    Omit<Task, "id" | "createdAt" | "updatedAt" | "createdBy" | "assignee">
  >;
  slot?: { start: Date; end: Date };
}

export interface UpdateTaskVariables {
  taskId: string;
  updates: Partial<Task>;
}

// Custom hook for fetching tasks
export const useFetchTasks = () => {
  return useQuery<Task[], Error>({
    queryKey: taskKeys.all,
    queryFn: async () => {
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

      return data
        ? data.map((task) =>
            mapTaskFromSupabase(task as TaskFromSupabase, user.id),
          )
        : [];
    },
  });
};

// Custom hook for creating a task
export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, CreateTaskVariables>({
    mutationFn: async ({ taskData, slot }) => {
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
      return mapTaskFromSupabase(data as TaskFromSupabase, user.id);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Task created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create task");
    },
  });
};

// Custom hook for updating a task
export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, UpdateTaskVariables>({
    mutationFn: async ({ taskId, updates }) => {
      const user = await getAuthenticatedUser();
      if (!user) throw new Error("User not authenticated for update");

      const tasks = queryClient.getQueryData<Task[]>(taskKeys.all);
      const taskToUpdate = tasks?.find((t) => t.id === taskId);

      if (!taskToUpdate) throw new Error("Task not found for update");

      const updatedTaskData = {
        ...taskToUpdate,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      const supabaseTask = mapTaskToSupabase(updatedTaskData);
      const { id, ...updatePayload } = supabaseTask;

      const { data, error: updateError } = await supabase
        .from("tasks")
        .update(updatePayload)
        .eq("id", taskId)
        .select()
        .single();

      if (updateError) throw updateError;
      return mapTaskFromSupabase(data as TaskFromSupabase, user.id);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Task updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update task");
    },
  });
};

// Custom hook for deleting a task
export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (taskId) => {
      const { error: deleteError } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId);
      if (deleteError) throw deleteError;
    },
    onSuccess: (data, taskId) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      toast.success("Task deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete task");
    },
  });
};
