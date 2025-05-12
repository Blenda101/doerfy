import { Task } from "../../types/task";
import { View } from "react-big-calendar";

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  task: Task;
}

export interface NewTaskState {
  date: Date | null;
  isEditing: boolean;
  title: string;
}

export interface EventDropArgs {
  event: CalendarEvent;
  start: Date;
  end: Date;
}

export interface CalendarProps {
  theme?: "light" | "dark";
  onTaskSelect: (task: Task) => void;
}

export interface ToolbarProps {
  toolbar: any;
  view: View;
  onViewChange: (view: View) => void;
  theme: "light" | "dark";
}

export interface DayCellProps {
  value: Date;
  children?: React.ReactNode;
  onAddTask: (date: Date) => void;
  newTask: NewTaskState;
  onNewTaskChange: (task: NewTaskState) => void;
  onNewTaskSave: () => void;
}
