import React, { useRef, useState } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Views,
  View,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { cn } from "../../../lib/utils";
import { CalendarProps, CalendarEvent } from "./types";
import { CustomEvent } from "./partials/CustomEvent";
import { CustomToolbar } from "./partials/CustomToolbar";
import { useTasks } from "./hooks/useTasks";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

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
const Calendar = withDragAndDrop(BigCalendar);

const CalendarView: React.FC<CalendarProps> = (props) => {
  const { theme = "light", onTaskSelect } = props;
  const { tasks, isLoading, error } = useTasks();
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());

  const calendarRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="relative flex-1 p-6" ref={calendarRef}>
      <BigCalendar<CalendarEvent>
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "calc(100vh - 160px)" }}
        defaultView={Views.DAY}
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

export { CalendarView };
