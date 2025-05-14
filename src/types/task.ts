import { Database } from "./supabase";

export type TimeStage = "queue" | "do" | "doing" | "today" | "done";
export type Priority = "high" | "medium" | "low";
export type Energy = "high" | "medium" | "low";
export type AgingStatus = "normal" | "warning" | "overdue";
export type RecurringPattern = Database["public"]["Enums"]["recurring_pattern"];
export type WeekDays = Database["public"]["Enums"]["week_days"];
export type EndsType = Database["public"]["Enums"]["ends_type"];

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskHistoryItem {
  timeStage: TimeStage;
  entryDate: string;
  userId?: string;
  daysInStage?: number;
}

export interface TaskSchedule {
  enabled: boolean;
  date: Date | null;
  time: string | null;
  leadDays?: number;
  leadHours?: number;
  durationDays?: number;
  durationHours?: number;
  alarmEnabled?: boolean;
  recurring?: {
    type: RecurringPattern;
    interval: number;
    weekDays?: WeekDays[];
    workdaysOnly?: boolean;
    ends?: {
      type: EndsType;
      date?: Date;
      occurrences?: number;
    };
  };
}

export type TaskFromSupabase = Database["public"]["Tables"]["tasks"]["Row"];

export interface Task {
  id: string;
  title: string;
  description: string;
  timeStage: TimeStage;
  stageEntryDate: string;
  assignee: string;
  priority: Priority;
  energy: Energy;
  location: string | null;
  story: string | null;
  labels: string[];
  listId: string | null;
  icon: string;
  showInTimeBox: boolean;
  showInList: boolean;
  showInCalendar: boolean;
  highlighted: boolean;
  status?: string;
  agingStatus?: AgingStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  checklistItems: ChecklistItem[];
  comments: any[];
  attachments: any[];
  history: TaskHistoryItem[];
  schedule: TaskSchedule | null;
}

// export interface Task {
//   id: string;
//   title: string;`
//   description: string;
//   timeStage: TimeStage;
//   stageEntryDate: string;

//   // Core Properties
//   assignee?: string;
//   listId?: string;
//   priority: Priority;
//   energy: Energy;
//   location: string | null;

//   // Relationships
//   story: string | null;

//   // Scheduling
//   schedule?: TaskSchedule;

//   // Metadata
//   labels: string[];
//   showInTimeBox: boolean;
//   showInList: boolean;
//   showInCalendar: boolean;
//   icon: string;
//   highlighted?: boolean;
//   status?: string;
//   agingStatus?: AgingStatus;

//   // History tracking
//   history: TaskHistoryItem[];

//   // System fields
//   createdAt: string;
//   updatedAt: string;
//   createdBy: string;

//   // Optional fields
//   checklistItems: ChecklistItem[];
//   comments: any[];
//   attachments: any[];

//   // Calendar
//   scheduleDate: string;
//   scheduleTime: string;
//   durationDays: number;
//   durationHours: number;
// }

export const AGING_THRESHOLDS = {
  do: {
    warning: 24,
    overdue: 30,
  },
  doing: {
    warning: 6,
    overdue: 7,
  },
  today: {
    warning: 1,
    overdue: 1,
  },
} as const;

export const SCHEDULING_THRESHOLDS = {
  queue: { min: 30, max: Infinity },
  do: { min: 8, max: 30 },
  doing: { min: 2, max: 7 },
  today: { min: 0, max: 1 },
} as const;

export function generateTaskId(): string {
  return crypto.randomUUID();
}
