import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { getDateInterval, getSlotInterval } from "./utils/getDateInterval";
import { Task } from "../../../types/task";
import { useTasks } from "../../../contexts/TaskContext";

const DATE_CELL_HEIGHT = 25;
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
  const {
    tasks,
    isLoadingTasks,
    tasksError,
    createTaskMutation,
    updateTaskMutation,
  } = useTasks();
  const [view, setView] = useState<View>(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
  } | null>(null);
  const [coordinates, setCoordinates] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const [newTaskTitle, setNewTaskTitle] = useState("");

  const calendarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // useEffect(() => {
  //   if (calendarRef.current) {
  //     calendarRef.current.addEventListener("mousemove", (e) => {
  //       console.log((e.target as HTMLElement).getBoundingClientRect());
  //     });
  //   }
  // }, []);

  // Handle event drag and drop
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
      const updatedTask = {
        ...event.task,
        schedule: {
          ...event.task.schedule,
          date: new Date(schedule_date),
          time: schedule_time,
          durationDays: duration_days,
          durationHours: duration_hours,
          enabled: true,
        },
        updatedAt: new Date().toISOString(),
      };

      updateTaskMutation.mutate({
        taskId: updatedTask.id,
        updates: updatedTask,
      });
    } catch (error) {
      console.error("Error moving task:", error);
    }
  };

  // Handle event resize
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
      const updatedTask: Task = {
        ...event.task,
        schedule: {
          ...event.task.schedule,
          date: new Date(schedule_date),
          time: schedule_time,
          durationDays: duration_days,
          durationHours: duration_hours,
          enabled: true,
        },
        updatedAt: new Date().toISOString(),
      };
      updateTaskMutation.mutate({
        taskId: updatedTask.id,
        updates: updatedTask,
      });
    } catch (error) {
      console.error("Error resizing task:", error);
    }
  };

  // Convert tasks to calendar events
  const events: CalendarEvent[] = tasks
    .filter(
      (task) => task.schedule && task.schedule?.enabled && task.schedule.date,
    )
    .map((task) => ({
      id: task.id,
      title: task.title,
      ...getSlotInterval(task.schedule!),
      task,
    }));

  const handleSelectSlot = (slot: SlotInfo) => {
    const startDateCell = document.querySelector(
      `[data-date="${slot.start.toISOString()}"]`,
    );
    const endDateCell = document.querySelector(
      `[data-date="${slot.end.toISOString()}"]`,
    );

    console.log(startDateCell, endDateCell);

    // If there is no start or end date cell, return. Start date cell must exist end date could be null if the last cell of a month is selected
    if ((!startDateCell && !endDateCell) || !startDateCell) return;

    // If there is no end date cell, use the start date cell this happens when the last cell of a month is selected
    const startRect = startDateCell.getBoundingClientRect();
    const endRect = endDateCell
      ? endDateCell.getBoundingClientRect()
      : startRect;

    console.log({ startRect, endRect });
    const { start, end } = slot;
    setCoordinates({
      x: startRect.left,
      y: startRect.top,
      width:
        startRect.left > endRect.left
          ? startRect.right - startRect.left
          : endRect.right - endRect.left,
      height: startRect.bottom - startRect.top,
    });
    setSelectedSlot({ start, end });
    setIsDialogOpen(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  console.log({ coordinates });

  const handleCreateTask = async () => {
    if (!selectedSlot || !newTaskTitle.trim()) return;

    try {
      createTaskMutation.mutate({
        taskData: {
          title: newTaskTitle.trim(),
        },
        slot: selectedSlot,
      });
      setNewTaskTitle("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  if (isLoadingTasks) {
    return <div>Loading...</div>;
  }

  if (tasksError) {
    return <div>Error: {tasksError.message}</div>;
  }

  return (
    <div className="relative flex-1 p-6 overflow-auto" ref={calendarRef}>
      <Calendar
        selectable
        resizable
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
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
          dateCellWrapper: CustomDateCellWrapper,
          timeSlotWrapper: CustomTimeSlotWrapper,
        }}
        onSelectEvent={(event: CalendarEvent) => onTaskSelect(event.task)}
        onSelectSlot={handleSelectSlot}
        onEventDrop={moveEvent as any}
        onEventResize={resizeEvent as any}
        draggableAccessor={() => true}
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
      {isDialogOpen && coordinates && (
        <div
          style={{
            position: "fixed",
            top: coordinates.y + DATE_CELL_HEIGHT,
            left: coordinates.x,
            width: coordinates.width,
            height: coordinates.height - DATE_CELL_HEIGHT,
            zIndex: 9999,
          }}
        >
          <textarea
            ref={inputRef}
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Enter task description"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleCreateTask();
                setIsDialogOpen(false);
              }
            }}
            autoFocus
            className="w-full h-full resize-none rounded-md border border-slate-300 bg-white p-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200"
          />
        </div>
      )}
      {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          disableOverlay
          style={{
            position: "fixed",
            top: `${coordinates?.y}px`,
            left: `${coordinates?.x}px`,
            transform: "translate(0, 0)",
            height: `${coordinates?.height}px`,
            width: `${coordinates?.width}px`,
          }}
        >
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
        </DialogContent>
      </Dialog> */}
      {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
      </Dialog> */}
    </div>
  );
};

export default CalendarView;

const CustomDateCellWrapper = (props: any) => {
  const child = React.cloneElement(props.children, {
    "data-date": props.value.toISOString(),
  });

  return child;
};

const CustomTimeSlotWrapper = (props: any) => {
  const child = React.cloneElement(props.children, {
    "data-date": props.value.toISOString(),
  });

  return child;
};
