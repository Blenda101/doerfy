import React, { useState } from "react";
import { Plus } from "lucide-react";
import { DayCellProps, NewTaskState } from "../types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../../components/ui/tooltip";
import { cn } from "../../../../lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../../components/ui/popover";
import { Input } from "../../../../components/ui/input";

/**
 * DayCell component renders a single day cell in the calendar
 * Handles task creation UI and interactions within each day cell
 */
export const DayCell: React.FC<DayCellProps> = ({
  value: date,
  children,
  createTask,
}) => {
  const [task, setTask] = useState<NewTaskState>({
    title: "",
    date,
  });

  const onSubmit = async () => {
    if (!task.date || !task.title) return;
    try {
      await createTask(task.title, task.date);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <div
      className={`w-full h-full flex flex-col border-r last:border-none group`}
    >
      {/* <div className="flex bg-slate-500">{children}</div> */}
      <div className="mt-7 p-1 flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <button className="btn">
              <Plus className="w-4 h-4 text-gray-400 hover:text-gray-900 cursor-pointer" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="left" className="p-0" sideOffset={-20}>
            <Input
              autoFocus
              value={task.title}
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onSubmit();
                }
              }}
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
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
