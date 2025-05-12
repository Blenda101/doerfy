import React from "react";
import { TaskHoverCard } from "../../../../components/TaskHoverCard";
import { cn } from "../../../../lib/utils";
import { CalendarEvent } from "../types";

/**
 * CustomEvent component renders a task event in the calendar
 * with hover functionality and priority-based styling
 */
export const CustomEvent: React.FC<{ event: CalendarEvent }> = ({ event }) => (
  <TaskHoverCard task={event.task}>
    <div
      className={cn(
        "truncate px-2 py-1 text-sm rounded cursor-pointer text-black",
        // Priority-based background colors
        event.task.priority === "high"
          ? "bg-red-100 dark:bg-red-900/20"
          : event.task.priority === "medium"
          ? "bg-yellow-100 dark:bg-yellow-900/20 "
          : "bg-green-100 dark:bg-green-900/20",
      )}
    >
      {event.title}
    </div>
  </TaskHoverCard>
);
