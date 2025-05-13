import { Task, TaskFromSupabase } from "../types/task";
import { TimeBox } from "../types/timeBox";
import { BannerConfig } from "../components/BannerManager";
import { supabase } from "./supabaseClient";
import { defaultTimeBoxes } from "../data/timeBoxes";

const STORAGE_KEYS = {
  TIME_BOXES: "doerfy_timeboxes",
} as const;

export function saveTimeBoxes(timeBoxes: TimeBox[]): void {
  localStorage.setItem(STORAGE_KEYS.TIME_BOXES, JSON.stringify(timeBoxes));
}

export function loadTimeBoxes(): TimeBox[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.TIME_BOXES);
    if (!stored) return defaultTimeBoxes;

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) && parsed.length > 0
      ? parsed
      : defaultTimeBoxes;
  } catch (e) {
    console.error("Failed to parse stored time boxes:", e);
    return defaultTimeBoxes;
  }
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("No authenticated user found");
    }

    const currentTime = new Date().toISOString();

    const tasksToUpsert: TaskFromSupabase[] = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      timestage: task.timeStage,
      stage_entry_date: task.stageEntryDate,
      assignee: user.id,
      list_id: task.listId,
      priority: task.priority,
      energy: task.energy,
      location: task.location,
      story: task.story,
      labels: task.labels,
      icon: task.icon,
      show_in_time_box: task.showInTimeBox ?? true,
      show_in_list: task.showInList ?? true,
      show_in_calendar: task.showInCalendar ?? false,
      highlighted: task.highlighted,
      status: task.status,
      aging_status: task.agingStatus,
      created_at: task.createdAt || currentTime,
      updated_at: currentTime,
      created_by: user.id,
      duration_days: task.schedule?.durationDays || 0,
      duration_hours: task.schedule?.durationHours || 0,
      lead_days: task.schedule?.leadDays || 0,
      lead_hours: task.schedule?.leadHours || 0,
      schedule_date: task.schedule?.date?.toISOString()! || "",
      schedule_time: task.schedule?.time! || "",
      recurring: task.schedule?.recurring?.type || null,
      story_id: task.story,
    }));

    const { error } = await supabase.from("tasks").upsert(tasksToUpsert, {
      onConflict: "id",
      ignoreDuplicates: false,
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error saving tasks to Supabase:", error);
    throw error;
  }
}

export async function loadTasks(): Promise<Task[]> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("No authenticated user found");
    }

    const { data: tasks, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("assignee", user.id)
      .order("created_at", { ascending: false });

    if (taskError) throw taskError;
    console.log({ db: tasks });
    return (tasks || []).map((task: TaskFromSupabase) => ({
      id: task.id,
      title: task.title,
      description: task.description,
      timeStage: task.timestage,
      stageEntryDate: task.stage_entry_date,
      assignee: task.assignee,
      listId: task.list_id,
      priority: task.priority,
      energy: task.energy,
      location: task.location,
      story: task.story,
      labels: task.labels || [],
      icon: task.icon,
      showInTimeBox: task.show_in_time_box ?? true,
      showInList: task.show_in_list ?? true,
      showInCalendar: task.show_in_calendar ?? false,
      highlighted: task.highlighted,
      status: task.status,
      agingStatus: task.aging_status,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      createdBy: task.created_by,

      checklistItems: [],
      comments: [],
      attachments: [],
      history: [],
      schedule: task.show_in_calendar
        ? {
            enabled: true,
            date: task.schedule_date ? new Date(task.schedule_date) : null,
            time: task.schedule_time || "09:00",
            leadDays: task.lead_days,
            leadHours: task.lead_hours,
            durationDays: task.duration_days,
            durationHours: task.duration_hours,
            alarmEnabled: false,
            recurring: undefined,
          }
        : null,
    }));
  } catch (error) {
    console.error("Error loading tasks from Supabase:", error);
    throw error;
  }
}

export async function deleteTask(taskId: string): Promise<void> {
  try {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error("Error deleting task from Supabase:", error);
    throw error;
  }
}

export async function saveBannerConfig(config: BannerConfig): Promise<void> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("No authenticated user found");
    }

    // Fetch the existing config to preserve fields not present in the new config
    const { data: existingConfigs, error: fetchError } = await supabase
      .from("banner_configs")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows found, which is okay for a new insert
      throw fetchError;
    }

    const existingConfig = existingConfigs || {};

    function mergeUniqueByKey<T>(arr1: T[] = [], arr2: T[] = [], key: keyof T): T[] {
      const map = new Map<string | number, T>();
      [...arr1, ...arr2].forEach(item => {
        const keyValue = item[key];
        map.set(keyValue as string | number, item);
      });
      return Array.from(map.values());
    }
    
    const mergedConfig = {
      user_id: user.id,
      images: mergeUniqueByKey(existingConfig.images, config.images, "url"),
      transition_time: config.transitionTime ?? existingConfig.transition_time,
      audio: mergeUniqueByKey(existingConfig.audio, config.audio, "url"),
      autoplay: config.autoplay ?? existingConfig.autoplay,
      volume: config.volume ?? existingConfig.volume,
      quotes: mergeUniqueByKey(existingConfig.quotes, config.quotes, "text"), // adjust if key is different
      quote_rotation: config.quoteRotation ?? existingConfig.quote_rotation,
      quote_duration: config.quoteDuration ?? existingConfig.quote_duration,
      text_style: config.textStyle ?? existingConfig.text_style,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from("banner_configs")
      .upsert(mergedConfig, {
        onConflict: "user_id",
      });

    if (upsertError) {
      throw upsertError;
    }
  } catch (error) {
    console.error("Error saving banner config:", error);
    throw error;
  }
}

export async function loadBannerConfig(): Promise<BannerConfig | null> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("No authenticated user found");
    }

    const { data: config, error } = await supabase
      .from("banner_configs")
      .select("*")
      .eq("user_id", user.id)
      .single();

    console.log("Banner config loaded:", config);
    console.log({ config });

    if (error) {
      throw error;
    }

    if (!config) {
      return null;
    }

    return {
      images: config.images || [],
      transitionTime: config.transition_time || 5,
      audio: config.audio || [],
      autoplay: config.autoplay || false,
      volume: config.volume || 50,
      quotes: config.quotes || [],
      quoteRotation: config.quote_rotation || false,
      quoteDuration: config.quote_duration || 10,
      textStyle: config.text_style || {
        font: "Inter",
        size: 24,
        color: "#FFFFFF",
      },
    };
  } catch (error) {
    console.error("Error loading banner config:", error);
    throw error;
  }
}
