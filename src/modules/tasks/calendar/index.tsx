import React, { useRef, useState, useMemo } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Views,
  View,
  SlotInfo,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { cn } from "../../../lib/utils";
import { CalendarProps, CalendarEvent } from "./types";
import { CustomEvent } from "./partials/CustomEvent";
import { CustomToolbar } from "./partials/CustomToolbar";
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
import { getDateInterval, getSlotInterval } from "./utils/getDateInterval";
import { Task } from "../../../types/task";
import { useTaskContext } from "../../../hooks/useTaskContext";
import { toast } from "react-hot-toast";

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
const DnDCalendar = withDragAndDrop<CalendarEvent>(BigCalendar);

const CalendarView: React.FC<CalendarProps> = (props) => {
  const { theme = "light", onTaskSelect } = props;
  const { tasks, isLoading, error, createTask, updateTask } = useTaskContext();

  const [view, setView] = useState<View>(Views.DAY);
  const [date, setDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<SlotInfo | null>(
    null,
  );
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const calendarRef = useRef<HTMLDivElement>(null);

  const moveEvent = async ({
    event,
    start,
    end,
  }: {
    event: CalendarEvent;
    start: Date;
    end: Date;
  }) => {
    try {
      const { schedule_date, schedule_time, duration_days, duration_hours } =
        getDateInterval({ start, end });

      const updatedSchedulePayload = {
        date: new Date(schedule_date),
        time: schedule_time,
        durationDays: duration_days,
        durationHours: duration_hours,
        enabled: true,
      };

      await updateTask(event.task.id, {
        schedule: updatedSchedulePayload,
        showInCalendar: true,
      });
      toast.success("Task moved successfully!");
    } catch (err) {
      console.error("Error moving task:", err);
      toast.error(err instanceof Error ? err.message : "Failed to move task.");
    }
  };

  const resizeEvent = async ({
    event,
    start,
    end,
  }: {
    event: CalendarEvent;
    start: Date;
    end: Date;
  }) => {
    try {
      const { schedule_date, schedule_time, duration_days, duration_hours } =
        getDateInterval({ start, end });

      const updatedSchedulePayload = {
        date: new Date(schedule_date),
        time: schedule_time,
        durationDays: duration_days,
        durationHours: duration_hours,
        enabled: true,
      };

      await updateTask(event.task.id, {
        schedule: updatedSchedulePayload,
        showInCalendar: true,
      });
      toast.success("Task resized successfully!");
    } catch (err) {
      console.error("Error resizing task:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to resize task.",
      );
    }
  };

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    return tasks
      .filter(
        (task) =>
          task.schedule &&
          task.schedule?.enabled &&
          task.schedule.date &&
          task.showInCalendar,
      )
      .map((task: Task) => ({
        id: task.id,
        title: task.title,
        ...getSlotInterval(task.schedule!),
        task,
      }));
  }, [tasks]);

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedSlotInfo(slotInfo);
    setNewTaskTitle("");
    setIsDialogOpen(true);
  };

  const handleCreateTaskFromSlot = async () => {
    if (!selectedSlotInfo || !newTaskTitle.trim()) return;

    try {
      const taskDataToCreate: Partial<
        Omit<Task, "id" | "createdAt" | "updatedAt" | "createdBy" | "assignee">
      > = {
        title: newTaskTitle.trim(),
        showInCalendar: true,
      };

      await createTask(taskDataToCreate, {
        start: selectedSlotInfo.start,
        end: selectedSlotInfo.end,
      });
      setNewTaskTitle("");
      setIsDialogOpen(false);
      setSelectedSlotInfo(null);
      toast.success("Task created on calendar!");
    } catch (err) {
      console.error("Error creating task from slot:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to create task on calendar.",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-500 p-3 bg-red-50 border border-red-300 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 p-6" ref={calendarRef}>
      <DnDCalendar
        selectable
        resizable
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        views={[Views.MONTH, Views.WEEK, Views.DAY]}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        components={{
          event: CustomEvent,
          toolbar: (toolbarProps) => (
            <CustomToolbar
              toolbar={toolbarProps}
              view={view}
              onViewChange={setView}
              theme={theme}
            />
          ),
        }}
        onSelectEvent={(event: CalendarEvent) => onTaskSelect(event.task)}
        onSelectSlot={handleSelectSlot}
        onEventDrop={moveEvent as any}
        onEventResize={resizeEvent as any}
        draggableAccessor={() => true}
        slotPropGetter={(currentDate) => {
          if (
            selectedSlotInfo &&
            currentDate >= selectedSlotInfo.start &&
            currentDate < selectedSlotInfo.end
          ) {
            return {
              style: {
                backgroundColor: "rgba(80, 54, 176, 0.1)",
              },
            };
          }
          return {
            style: {
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
            theme === "dark"
              ? "dark:bg-slate-800 dark:border-slate-700"
              : "bg-white",
          )}
        >
          <DialogHeader>
            <DialogTitle
              className={cn(
                theme === "dark" ? "text-slate-200" : "text-gray-900",
              )}
            >
              Create New Task on Calendar
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className={cn(
                  theme === "dark" ? "text-slate-200" : "text-gray-700",
                )}
              >
                Task Title
              </Label>
              <Input
                id="title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title"
                className={cn(
                  theme === "dark"
                    ? "dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 placeholder:text-slate-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400",
                )}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateTaskFromSlot();
                  }
                }}
              />
            </div>
            <DialogFooter
              className={cn(
                theme === "dark" ? "border-slate-700" : "border-gray-200",
                "pt-4",
              )}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setSelectedSlotInfo(null);
                }}
                className={cn(
                  theme === "dark"
                    ? "dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50",
                )}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateTaskFromSlot}
                disabled={!newTaskTitle.trim()}
                className={cn(
                  theme === "dark"
                    ? "dark:bg-purple-600 dark:text-white dark:hover:bg-purple-700"
                    : "bg-purple-600 text-white hover:bg-purple-700",
                )}
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
