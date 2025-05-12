import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Input } from "../../../../components/ui/input";
import { cn } from "../../../../lib/utils";
import { DayCellProps } from "../types";

/**
 * DayCell component renders a single day cell in the calendar
 * Handles task creation UI and interactions within each day cell
 */
export const DayCell: React.FC<DayCellProps> = ({
  value: date,
  children,
  onAddTask,
  newTask,
  onNewTaskChange,
  onNewTaskSave,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isNewTaskDate =
    newTask.date && date && newTask.date.getTime() === date.getTime();

  return (
    <div
      className="relative w-full h-full group"
      onMouseEnter={() => date && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      Hello
      {/* Add Task Button - Shows on hover */}
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
              onAddTask(date);
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
      {/* New Task Input - Shows when creating a new task */}
      {isNewTaskDate && (
        <div className="absolute inset-x-0 top-6 p-1 z-10">
          <Input
            autoFocus
            value={newTask.title}
            onChange={(e) =>
              onNewTaskChange({ ...newTask, title: e.target.value })
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onNewTaskSave();
              } else if (e.key === "Escape") {
                onNewTaskChange({
                  date: null,
                  isEditing: false,
                  title: "",
                });
              }
            }}
            onBlur={onNewTaskSave}
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
