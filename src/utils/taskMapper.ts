import {
  Task,
  TaskFromSupabase,
  RecurringPattern,
  Priority,
  TimeStage,
  Energy,
  AgingStatus,
  WeekDays,
  EndsType,
} from "../types/task";

export function mapTaskFromSupabase(
  data: TaskFromSupabase,
  userId: string,
): Task {
  return {
    id: data.id,
    title: data.title,
    description: data.description ?? "",
    timeStage: data.timestage as TimeStage,
    stageEntryDate: data.stage_entry_date,
    assignee: data.assignee,
    listId: data.list_id,
    priority: data.priority as Priority,
    energy: data.energy as Energy,
    location: data.location,
    story: data.story_id,
    labels: data.labels || [],
    icon: data.icon ?? "",
    showInTimeBox: data.show_in_time_box ?? true,
    showInList: data.show_in_list ?? true,
    showInCalendar: data.show_in_calendar ?? false,
    highlighted: data.highlighted ?? false,
    status: data.status ?? undefined,
    agingStatus: data.aging_status as AgingStatus,
    createdAt: data.created_at ?? "",
    updatedAt: data.updated_at ?? "",
    createdBy: data.created_by,
    schedule: data.schedule_date
      ? {
          enabled: true,
          date: new Date(data.schedule_date),
          time: data.schedule_time ?? "",
          leadDays: data.lead_days || 0,
          leadHours: data.lead_hours || 0,
          durationDays: data.duration_days || 0,
          durationHours: data.duration_hours || 0,
          alarmEnabled: data.alarm_enabled ?? false,
          recurring:
            data.recurring !== null
              ? {
                  type: data.recurring as RecurringPattern,
                  interval: data.recurring_interval ?? 0,
                  weekDays: data.week_days as WeekDays[],
                  workdaysOnly: data.workdays_only ?? false,
                  ends:
                    data.ends_type !== "never" || !data.ends_type
                      ? {
                          type: data.ends_type as EndsType,
                          date: data.ends_date
                            ? new Date(data.ends_date)
                            : undefined,
                          occurrences: data.ends_after_occurrences || undefined,
                        }
                      : undefined,
                }
              : undefined,
        }
      : null,
    checklistItems: [],
    comments: [],
    attachments: [],
    history: [
      {
        timeStage: data.timestage as TimeStage,
        entryDate: data.stage_entry_date,
        userId: userId,
      },
    ],
  };
}

export function mapTaskToSupabase(task: Task): TaskFromSupabase {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    timestage: task.timeStage,
    stage_entry_date: task.stageEntryDate,
    assignee: task.assignee,
    list_id: task.listId,
    aging_status: task.agingStatus ?? null,
    created_at: task.createdAt,
    created_by: task.createdBy,
    energy: task.energy,
    location: task.location,
    story_id: task.story ?? null,
    labels: task.labels,
    icon: task.icon,
    show_in_time_box: task.showInTimeBox,
    show_in_list: task.showInList,
    show_in_calendar: task.showInCalendar,
    highlighted: task.highlighted,
    status: task.status ?? null,
    priority: task.priority,
    updated_at: task.updatedAt || new Date().toISOString(),
    schedule_date: task.schedule?.date?.toISOString() ?? null,
    schedule_time:
      task.schedule?.time === "" || !task.schedule?.time
        ? null
        : task.schedule?.time,
    lead_days: task.schedule?.leadDays ?? 0,
    lead_hours: task.schedule?.leadHours ?? 0,
    duration_days: task.schedule?.durationDays ?? 0,
    duration_hours: task.schedule?.durationHours ?? 0,
    recurring: task.schedule?.recurring?.type ?? null,
    recurring_interval: task.schedule?.recurring?.interval ?? 0,
    week_days: task.schedule?.recurring?.weekDays ?? null,
    workdays_only: task.schedule?.recurring?.workdaysOnly ?? false,
    ends_type: task.schedule?.recurring?.ends?.type ?? null,
    ends_date: task.schedule?.recurring?.ends?.date?.toISOString() ?? null,
    ends_after_occurrences: task.schedule?.recurring?.ends?.occurrences ?? null,
    alarm_enabled: task.schedule?.alarmEnabled ?? false,
  };
}
