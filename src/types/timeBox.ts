import { Database } from "./supabase";

export type TimeBox = Database["public"]["Tables"]["time_boxes"]["Row"];

export type TimeBoxStage = "queue" | "do" | "doing" | "today" | "done";
