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
        "truncate px-2 py-1 text-sm rounded-md cursor-pointer transition-all duration-200 ease-in-out border border-black",
        "hover:shadow-md",
        "border border-opacity-70 ",
        // Priority-based styling
        event.task.priority === "high"
          ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
          : event.task.priority === "medium"
          ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300"
          : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300",
      )}
    >
      <div className="flex items-center gap-1.5">
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            event.task.priority === "high"
              ? "bg-red-500"
              : event.task.priority === "medium"
              ? "bg-yellow-500"
              : "bg-green-500",
          )}
        />
        <span className="font-medium">{event.title}</span>
      </div>
    </div>
  </TaskHoverCard>
);
