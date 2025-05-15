import { Task, TaskFromSupabase } from "../types/task";
import { TimeBox } from "../types/timeBox";
import { BannerConfig } from "../components/BannerManager";
import { supabase } from "./supabaseClient";
import { defaultTimeBoxes } from "../data/timeBoxes";
import { mapTaskFromSupabase, mapTaskToSupabase } from "./taskMapper";

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

    const tasksToUpsert = tasks.map((task) => mapTaskToSupabase(task));
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
    return (tasks || []).map((task: TaskFromSupabase) =>
      mapTaskFromSupabase(task, user.id),
    );
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

    function mergeUniqueByKey<T>(
      arr1: T[] = [],
      arr2: T[] = [],
      key: keyof T,
    ): T[] {
      const map = new Map<string | number, T>();
      [...arr1, ...arr2].forEach((item) => {
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
