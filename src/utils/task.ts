import {
  TaskFromSupabase,
  TimeStage,
  Energy,
  AgingStatus,
  Task,
} from "../types/task";

export function getTask(data: Partial<TaskFromSupabase>): TaskFromSupabase {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    timestage: "queue" as TimeStage,
    stage_entry_date: now,
    assignee: "",
    list_id: null,
    aging_status: "normal" as AgingStatus,
    priority: "medium",
    energy: "medium" as Energy,
    location: null,
    story: null,
    story_id: null,
    labels: [],
    show_in_time_box: true,
    show_in_list: true,
    show_in_calendar: false,
    icon: "blue",
    highlighted: false,
    created_at: now,
    updated_at: now,
    created_by: "",
    schedule_date: "",
    schedule_time: "",
    lead_days: 0,
    lead_hours: 0,
    duration_days: 0,
    duration_hours: 0,
    recurring: null,
    ...data,
  };
}
