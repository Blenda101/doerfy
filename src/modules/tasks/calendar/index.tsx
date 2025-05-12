import React, { useState } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Views,
  View,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { cn } from "../../../lib/utils";
import { CalendarProps, CalendarEvent, NewTaskState } from "./types";
import { CustomEvent } from "./partials/CustomEvent";
import { CustomToolbar } from "./partials/CustomToolbar";
import { DayCell } from "./partials/DayCell";
import { useTasks } from "./hooks/useTasks";

// Configure date-fns localizer for react-big-calendar
const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

/**
 * Main Calendar component that integrates all calendar functionality
 * Handles task management, event rendering, and calendar interactions
 */
export const Calendar: React.FC<CalendarProps> = ({
  theme = "light",
  onTaskSelect,
}) => {
  const { tasks, isLoading, error, createTask, moveTask } = useTasks();
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [newTask, setNewTask] = useState<NewTaskState>({
    date: null,
    isEditing: false,
    title: "",
  });

  // Handle task drag and drop
  const handleEventDrop = async ({ event, start }: any) => {
    try {
      await moveTask(event.task.id, start);
    } catch (error) {
      console.error("Error moving task:", error);
    }
  };

  // Handle adding a new task
  const handleAddTask = (date: Date) => {
    setNewTask({
      date,
      isEditing: true,
      title: "",
    });
  };

  // Save a new task
  const handleNewTaskSave = async () => {
    if (!newTask.date || !newTask.title.trim()) {
      setNewTask({
        date: null,
        isEditing: false,
        title: "",
      });
      return;
    }

    try {
      await createTask(newTask.title.trim(), newTask.date);
      setNewTask({
        date: null,
        isEditing: false,
        title: "",
      });
    } catch (error) {
      console.error("Error creating new task:", error);
    }
  };

  // Convert tasks to calendar events
  const events: CalendarEvent[] = tasks
    .filter((task) => task.schedule?.enabled && task.schedule.date)
    .map((task) => ({
      id: task.id,
      title: task.title,
      start: new Date(task.schedule!.date!),
      end: new Date(task.schedule!.date!),
      task,
    }));

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  console.log({ events, tasks });
  return (
    <div className="flex-1 p-6">
      <BigCalendar<CalendarEvent>
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "calc(100vh - 160px)" }}
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        components={{
          event: CustomEvent,
          toolbar: (props) => (
            <CustomToolbar
              toolbar={props}
              view={view}
              onViewChange={setView}
              theme={theme}
            />
          ),
          dateCellWrapper: (props) => (
            <DayCell
              {...props}
              createTask={createTask}
              onAddTask={handleAddTask}
              newTask={newTask}
              onNewTaskChange={setNewTask}
              onNewTaskSave={handleNewTaskSave}
            />
          ),
        }}
        onSelectEvent={(event: CalendarEvent) => onTaskSelect(event.task)}
        className={cn(
          "rounded-lg border",
          theme === "dark"
            ? "border-slate-700 bg-slate-800 text-white"
            : "border-gray-200",
        )}
        selectable
      />
    </div>
  );
};
