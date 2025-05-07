export type TimeStage = 'queue' | 'do' | 'doing' | 'today' | 'done';
export type Priority = 'high' | 'medium' | 'low';
export type Energy = 'high' | 'medium' | 'low';
export type AgingStatus = 'normal' | 'warning' | 'overdue';

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
  time: string;
  leadDays?: number;
  leadHours?: number;
  durationDays?: number;
  durationHours?: number;
  alarmEnabled?: boolean;
  recurring?: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    weekDays?: string[];
    monthDay?: number;
    monthWeek?: '1st' | '2nd' | '3rd' | '4th' | 'last';
    monthWeekDay?: string;
    workdaysOnly?: boolean;
    ends?: {
      type: 'date' | 'occurrences' | 'endless';
      date?: Date;
      occurrences?: number;
    };
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  timestage: TimeStage;
  stage_entry_date: string;
  
  // Core Properties
  assignee: string;
  list: string;
  priority: Priority;
  energy: Energy;
  location: string | null;
  
  // Relationships
  story: string | null;
  
  // Scheduling
  schedule?: TaskSchedule;
  
  // Metadata
  labels: string[];
  show_in_time_box: boolean;
  show_in_list: boolean;
  show_in_calendar: boolean;
  icon: string;
  highlighted?: boolean;
  status?: string;
  aging_status?: AgingStatus;
  
  // History tracking
  history: TaskHistoryItem[];
  
  // System fields
  created_at: string;
  updated_at: string;
  created_by: string;
  
  // Optional fields
  checklistItems: ChecklistItem[];
  comments: any[];
  attachments: any[];
}

export const AGING_THRESHOLDS = {
  do: {
    warning: 24,
    overdue: 30
  },
  doing: {
    warning: 6,
    overdue: 7
  },
  today: {
    warning: 1,
    overdue: 1
  }
} as const;

export const SCHEDULING_THRESHOLDS = {
  queue: { min: 30, max: Infinity },
  do: { min: 8, max: 30 },
  doing: { min: 2, max: 7 },
  today: { min: 0, max: 1 }
} as const;

export function generateTaskId(): string {
  return crypto.randomUUID();
}