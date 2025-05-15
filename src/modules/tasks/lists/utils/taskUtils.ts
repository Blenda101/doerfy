import { Task } from "../../../../types/task";
import { supabase } from "../../../../utils/supabaseClient";
import { getAuthenticatedUser } from "../../../../utils/auth";
import { mapTaskFromSupabase } from "../../../../utils/taskMapper";

export async function createNewTask(
  title: string = "",
  timestage: string = "queue",
  listId?: string,
): Promise<Task> {
  try {
    const user = await getAuthenticatedUser();

    if (!timestage) {
      throw new Error("timestage is required");
    }

    const now = new Date().toISOString();
    const taskTitle = title.trim() || "New Task";

    const task = {
      id: crypto.randomUUID(),
      title: taskTitle,
      description: "",
      timestage: timestage,
      stage_entry_date: now,
      assignee: user.id,
      list_id: listId,
      aging_status: "normal",
      priority: "medium",
      energy: "medium",
      location: null,
      story: null,
      labels: [],
      show_in_time_box: true,
      show_in_list: true,
      show_in_calendar: false,
      icon: "blue",
      highlighted: false,
      created_at: now,
      updated_at: now,
      created_by: user.id,
      schedule_date: null,
      schedule_time: null,
      lead_days: 0,
      lead_hours: 0,
      duration_days: 0,
      duration_hours: 0,
      recurring: null,
    };

    console.log("Creating new task:", task);
    const { data, error } = await supabase
      .from("tasks")
      .insert(task)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapTaskFromSupabase(data, user.id);
  } catch (error) {
    console.error("Error creating new task:", error);
    throw error;
  }
}

export function validateTaskTitle(title: string): string {
  return title.trim() || "New Task";
}
