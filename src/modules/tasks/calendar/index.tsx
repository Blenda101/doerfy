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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import getDateInterval from "./utils/getDateInterval";

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
const Calendar = withDragAndDrop<CalendarEvent>(BigCalendar);

const CalendarView: React.FC<CalendarProps> = (props) => {
  const { theme = "light", onTaskSelect } = props;
  const { tasks, isLoading, error, createTask } = useTasks();
  const [view, setView] = useState<View>(Views.DAY);
  const [date, setDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");

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

  console.log({ events, tasks });

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end });
    setIsDialogOpen(true);
  };

  const handleCreateTask = async () => {
    if (!selectedSlot || !newTaskTitle.trim()) return;

    try {
      const { schedule_date, schedule_time, duration_days, duration_hours } =
        getDateInterval(selectedSlot);

      await createTask({
        title: newTaskTitle.trim(),
        schedule_date,
        schedule_time,
        duration_days,
        duration_hours,
        show_in_calendar: true,
      });
      setNewTaskTitle("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="relative flex-1 p-6" ref={calendarRef}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        selectable
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
        onSelectSlot={handleSelectSlot}
        slotPropGetter={(date) => {
          if (
            selectedSlot &&
            date >= selectedSlot.start &&
            date < selectedSlot.end
          ) {
            return {
              style: {
                backgroundColor: "rgba(80, 54, 176, 0.1)",
              },
            };
          }
          return {
            style: {
              backgroundColor: "white",
              border: "none",
            },
          };
        }}
        style={{ height: "calc(100vh - 160px)" }}
        className={cn(
          "rounded-lg border",
          theme === "dark"
            ? "border-slate-700 bg-slate-800 text-white"
            : "border-gray-200",
        )}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className={cn(
            "sm:max-w-[425px]",
            "dark:bg-slate-800 dark:border-slate-700",
          )}
        >
          <DialogHeader>
            <DialogTitle className="dark:text-slate-200">
              Create New Task
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="dark:text-slate-200">
                Task Title
              </Label>
              <Input
                id="title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title"
                className="dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateTask();
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTask}
                disabled={!newTaskTitle.trim()}
                className="dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700"
              >
                Create Task
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;
