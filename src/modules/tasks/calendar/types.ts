import {
  View,
  Event as BigCalendarEvent,
  CalendarProps as BigCalendarProps,
} from "react-big-calendar";
import { Task, TaskSchedule } from "../../../types/task";
import { Theme } from "../../../utils/theme";

// Props for the main Calendar component
export interface CalendarProps {
  theme?: Theme;
  onTaskSelect: (task: Task) => void;
}

// Custom event type for the calendar
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  task: Task;
}

// State for creating new tasks
export interface NewTaskState {
  date: Date | null;
  isEditing: boolean;
  title: string;
}

// Arguments for event drop functionality
export interface EventDropArgs {
  event: CalendarEvent;
  start: Date;
  end: Date;
}

// Extended calendar props with custom event drop handler
export type ExtendedCalendarProps = Omit<
  BigCalendarProps<CalendarEvent>,
  "onEventDrop"
> & {
  onEventDrop?: (args: EventDropArgs) => void;
};

// Props for the custom toolbar component
export interface ToolbarProps {
  toolbar: any;
  view: View;
  onViewChange: (view: View) => void;
  theme: Theme;
}

// Props for the day cell component
export interface DayCellProps {
  value: Date;
  children?: React.ReactNode;
  onAddTask: (date: Date) => void;
  newTask: NewTaskState;
  onNewTaskChange: (task: NewTaskState) => void;
  onNewTaskSave: () => void;
}
