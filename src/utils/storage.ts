import { TimeBox } from "../types/timeBox";
import { BannerConfig } from "../components/BannerManager";
import { supabase } from "./supabaseClient";
import { defaultTimeBoxes } from "../data/timeBoxes";
import { Task, TaskFromSupabase } from "../types/task";
import { mapTaskFromSupabase } from "./taskMapper";

// Define Json type for Supabase compatibility if not available from client
type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

const STORAGE_KEYS = {
  TIME_BOXES: "doerfy_timeboxes",
} as const;

export function saveTimeBoxes(timeBoxes: TimeBox[]): void {
  localStorage.setItem(STORAGE_KEYS.TIME_BOXES, JSON.stringify(timeBoxes));
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

    const existingConfigData = existingConfigs || {
      images: [] as BannerConfig["images"],
      transition_time: 5,
      audio: [] as BannerConfig["audio"],
      autoplay: false,
      volume: 50,
      quotes: [] as BannerConfig["quotes"],
      quote_rotation: false,
      quote_duration: 10,
      text_style: {
        font: "Inter",
        size: 24,
        color: "#FFFFFF",
      } as BannerConfig["textStyle"],
    };

    function mergeUniqueByKey<T extends Record<K, any>, K extends keyof T>(
      arr1: T[] = [],
      arr2: T[] = [],
      key: K,
    ): T[] {
      const map = new Map<string | number | symbol, T>();
      [...arr1, ...arr2].forEach((item) => {
        const keyValue = item[key];
        map.set(keyValue as string | number | symbol, item);
      });
      return Array.from(map.values());
    }

    const defaultTextStyle = { font: "Inter", size: 24, color: "#FFFFFF" };

    const imagesFromDb: BannerConfig["images"][number][] = Array.isArray(
      existingConfigData.images,
    )
      ? (existingConfigData.images as BannerConfig["images"][number][])
      : [];
    const audioFromDb: BannerConfig["audio"][number][] = Array.isArray(
      existingConfigData.audio,
    )
      ? (existingConfigData.audio as BannerConfig["audio"][number][])
      : [];
    const quotesFromDb: BannerConfig["quotes"][number][] = Array.isArray(
      existingConfigData.quotes,
    )
      ? (existingConfigData.quotes as BannerConfig["quotes"][number][])
      : [];

    const mergedConfig = {
      user_id: user.id,
      images: mergeUniqueByKey<BannerConfig["images"][number], "url">(
        imagesFromDb,
        config.images || [],
        "url",
      ) as unknown as Json,
      transition_time:
        config.transitionTime ?? existingConfigData.transition_time ?? 5,
      audio: mergeUniqueByKey<BannerConfig["audio"][number], "url">(
        audioFromDb,
        config.audio || [],
        "url",
      ) as unknown as Json,
      autoplay: config.autoplay ?? existingConfigData.autoplay ?? false,
      volume: config.volume ?? existingConfigData.volume ?? 50,
      quotes: mergeUniqueByKey<BannerConfig["quotes"][number], "text">(
        quotesFromDb,
        config.quotes || [],
        "text",
      ) as unknown as Json,
      quote_rotation:
        config.quoteRotation ?? existingConfigData.quote_rotation ?? false,
      quote_duration:
        config.quoteDuration ?? existingConfigData.quote_duration ?? 10,
      text_style: (config.textStyle ??
        existingConfigData.text_style ??
        defaultTextStyle) as unknown as Json,
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

    if (error && error.code !== "PGRST116") {
      // PGRST116: No rows found
      throw error;
    }

    if (!config) {
      return null;
    }

    const defaultTextStyle = { font: "Inter", size: 24, color: "#FFFFFF" };

    return {
      images: (config.images as unknown as BannerConfig["images"]) || [],
      transitionTime: config.transition_time ?? 5,
      audio: (config.audio as unknown as BannerConfig["audio"]) || [],
      autoplay: config.autoplay ?? false,
      volume: config.volume ?? 50,
      quotes: (config.quotes as unknown as BannerConfig["quotes"]) || [],
      quoteRotation: config.quote_rotation ?? false,
      quoteDuration: config.quote_duration ?? 10,
      textStyle:
        (config.text_style
          ? (config.text_style as unknown as BannerConfig["textStyle"])
          : defaultTextStyle) ?? defaultTextStyle,
    };
  } catch (error) {
    console.error("Error loading banner config:", error);
    throw error;
  }
}
