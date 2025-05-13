import { Task, TaskFromSupabase, RecurringPattern } from "../types/task";

export function mapTaskFromSupabase(
  data: TaskFromSupabase,
  userId: string,
): Task {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    timeStage: data.timestage,
    stageEntryDate: data.stage_entry_date,
    assignee: data.assignee,
    listId: data.list_id,
    priority: data.priority,
    energy: data.energy,
    location: data.location,
    story: data.story,
    labels: data.labels || [],
    icon: data.icon,
    showInTimeBox: data.show_in_time_box ?? true,
    showInList: data.show_in_list ?? true,
    showInCalendar: data.show_in_calendar ?? false,
    highlighted: data.highlighted,
    status: data.status,
    agingStatus: data.aging_status,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
    schedule: data.schedule_date
      ? {
          enabled: true,
          date: new Date(data.schedule_date),
          time: data.schedule_time || "",
          leadDays: data.lead_days || 0,
          leadHours: data.lead_hours || 0,
          durationDays: data.duration_days || 0,
          durationHours: data.duration_hours || 0,
          recurring: data.recurring
            ? {
                type: data.recurring as RecurringPattern,
                interval: 1,
              }
            : undefined,
        }
      : null,
    checklistItems: [],
    comments: [],
    attachments: [],
    history: [
      {
        timeStage: data.timestage,
        entryDate: data.stage_entry_date,
        userId: userId,
      },
    ],
  };
}
