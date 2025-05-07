import React, { useState, useEffect } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Views,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enUS } from "date-fns/locale";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { PropertySheet } from "../../components/PropertySheet";
import { TaskHoverCard } from "../../components/TaskHoverCard";
import { Task } from "../../types/task";
import { loadTasks, saveTasks } from "../../utils/storage";
import { cn } from "../../lib/utils";
import { Theme } from "../../utils/theme";
import { Plus } from "lucide-react";
import { createNewTask } from "../../utils/taskUtils";

interface CalendarProps {
  theme?: Theme;
}

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

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  task: Task;
}

interface NewTaskState {
  date: Date | null;
  isEditing: boolean;
  title: string;
}

export const Calendar: React.FC<CalendarProps> = ({ theme = "light" }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [view, setView] = useState(Views.MONTH);
  const [date, setDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [newTask, setNewTask] = useState<NewTaskState>({
    date: null,
    isEditing: false,
    title: "",
  });

  useEffect(() => {
    const loadTaskData = async () => {
      try {
        const loadedTasks = await loadTasks();
        console.log("Loaded tasks:", loadedTasks);
        setTasks(loadedTasks.filter((task) => task.show_in_calendar));
      } catch (error) {
        console.error("Error loading tasks:", error);
      }
    };

    loadTaskData();
  }, []);

  const handleTaskUpdate = async (updatedTask: Task) => {
    try {
      const updatedTasks = tasks.map((task) =>
        task.id === updatedTask.id ? updatedTask : task,
      );
      await saveTasks(updatedTasks);
      setTasks(updatedTasks);
      setSelectedTask(updatedTask);
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleEventDrop = async ({ event, start, end }: any) => {
    try {
      const updatedTask = {
        ...event.task,
        schedule: {
          ...event.task.schedule,
          date: start,
        },
        updatedAt: new Date().toISOString(),
      };

      const updatedTasks = tasks.map((task) =>
        task.id === event.task.id ? updatedTask : task,
      );
      await saveTasks(updatedTasks);
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Error moving task:", error);
    }
  };

  const handleAddTask = async (date: Date) => {
    setNewTask({
      date,
      isEditing: true,
      title: "",
    });
  };

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
      const task = await createNewTask("personal");
      task.title = newTask.title.trim();
      task.schedule = {
        enabled: true,
        date: newTask.date,
        time: "09:00",
        leadDays: 0,
        leadHours: 0,
      };

      const updatedTasks = [task, ...tasks];
      await saveTasks(updatedTasks);
      setTasks(updatedTasks);
      setSelectedTask(task);
      setNewTask({
        date: null,
        isEditing: false,
        title: "",
      });
    } catch (error) {
      console.error("Error creating new task:", error);
    }
  };

  const events: CalendarEvent[] = tasks
    .filter((task) => task.schedule?.enabled && task.schedule.date)
    .map((task) => ({
      id: task.id,
      title: task.title,
      start: new Date(task.schedule!.date!),
      end: new Date(task.schedule!.date!),
      task,
    }));

  const CustomEvent = ({ event }: { event: CalendarEvent }) => (
    <TaskHoverCard task={event.task}>
      <div
        className={cn(
          "truncate px-2 py-1 text-sm rounded cursor-pointer",
          event.task.priority === "high"
            ? "bg-red-100 dark:bg-red-900/20"
            : event.task.priority === "medium"
            ? "bg-yellow-100 dark:bg-yellow-900/20"
            : "bg-green-100 dark:bg-green-900/20",
        )}
      >
        {event.title}
      </div>
    </TaskHoverCard>
  );

  const CustomToolbar = (toolbar: any) => {
    const goToToday = () => {
      toolbar.onNavigate("TODAY");
    };

    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toolbar.onNavigate("PREV")}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toolbar.onNavigate("NEXT")}
          >
            Next
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>
        <h2
          className={cn(
            "text-xl font-semibold",
            theme === "dark" ? "text-white" : "text-gray-900",
          )}
        >
          {toolbar.label}
        </h2>
        <div className="flex items-center space-x-2">
          <Button
            variant={view === Views.MONTH ? "default" : "outline"}
            size="sm"
            onClick={() => setView(Views.MONTH)}
          >
            Month
          </Button>
          <Button
            variant={view === Views.WEEK ? "default" : "outline"}
            size="sm"
            onClick={() => setView(Views.WEEK)}
          >
            Week
          </Button>
          <Button
            variant={view === Views.DAY ? "default" : "outline"}
            size="sm"
            onClick={() => setView(Views.DAY)}
          >
            Day
          </Button>
        </div>
      </div>
    );
  };

  const DayCell = ({
    value: date,
    children,
  }: {
    value: Date;
    children?: React.ReactNode;
  }) => {
    const isHovered =
      hoveredDate && date && hoveredDate.getTime() === date.getTime();
    const isNewTaskDate =
      newTask.date && date && newTask.date.getTime() === date.getTime();

    return (
      <div
        className="relative w-full h-full group"
        onMouseEnter={() => date && setHoveredDate(date)}
        onMouseLeave={() => setHoveredDate(null)}
      >
        {children}
        {!isNewTaskDate && (
          <div
            className={cn(
              "absolute inset-0 top-6 flex items-start justify-end p-1",
              "transition-opacity duration-200",
              isHovered ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded flex items-center justify-center cursor-pointer",
                "bg-transparent hover:bg-gray-100 dark:hover:bg-slate-700",
                "transition-colors duration-200",
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleAddTask(date);
              }}
            >
              <Plus
                className={cn(
                  "w-4 h-4",
                  "text-gray-600 dark:text-gray-400",
                  "group-hover:text-gray-900 dark:group-hover:text-white",
                  "transition-colors duration-200",
                )}
              />
            </div>
          </div>
        )}
        {isNewTaskDate && (
          <div className="absolute inset-x-0 top-6 p-1 z-10">
            <Input
              autoFocus
              value={newTask.title}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, title: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleNewTaskSave();
                } else if (e.key === "Escape") {
                  setNewTask({
                    date: null,
                    isEditing: false,
                    title: "",
                  });
                }
              }}
              onBlur={handleNewTaskSave}
              className={cn(
                "w-full text-sm h-8 px-2",
                "bg-white dark:bg-slate-800",
                "border border-gray-200 dark:border-slate-700",
                "text-gray-900 dark:text-white",
                "placeholder:text-gray-400 dark:placeholder:text-gray-500",
                "focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400",
                "focus:border-transparent",
              )}
              placeholder="Enter task title..."
            />
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="flex flex-1 h-full">
      <div className="flex-1 p-6">
        <BigCalendar
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
            toolbar: CustomToolbar,
            dateCellWrapper: DayCell,
          }}
          onSelectEvent={(event: CalendarEvent) => setSelectedTask(event.task)}
          onEventDrop={handleEventDrop}
          draggableAccessor={() => true}
          className={cn(
            "rounded-lg border",
            theme === "dark"
              ? "border-slate-700 bg-slate-800 text-white"
              : "border-gray-200",
          )}
        />
      </div>

      {selectedTask && (
        <div
          className={cn(
            "border-l",
            theme === "dark"
              ? "border-[#334155] bg-[#1E293B]"
              : "border-gray-200",
          )}
        >
          <PropertySheet
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onTaskUpdate={handleTaskUpdate}
            theme={theme}
          />
        </div>
      )}
    </div>
  );
};