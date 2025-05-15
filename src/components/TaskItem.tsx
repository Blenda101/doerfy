import React from "react";
import { Task } from "../types/task";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { TaskHoverCard } from "./TaskHoverCard";
import { InlineTaskEditor } from "./InlineTaskEditor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { MoreHorizontal, InfoIcon, Edit, Trash2 } from "lucide-react";
import { cn } from "../lib/utils";
import { Theme } from "../utils/theme";

interface TaskItemProps {
  task: Task;
  theme: Theme;
  isSelected: boolean;
  isEditing: boolean;
  newTaskTitle: string;
  onTaskSelect: (task: Task) => void;
  onTaskComplete: (taskId: string) => void;
  onEditStart: (taskId: string) => void;
  onTitleChange: (title: string) => void;
  onTitleUpdate: (taskId: string, title: string) => void;
  onEditCancel: () => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  theme,
  isSelected,
  isEditing,
  newTaskTitle,
  onTaskSelect,
  onTaskComplete,
  onEditStart,
  onTitleChange,
  onTitleUpdate,
  onEditCancel,
  onDeleteTask,
}) => {
  return (
    <div
      className={cn(
        "flex items-start space-x-2 p-2 rounded-lg group",
        "hover:bg-gray-50 dark:hover:bg-gray-800",
        "cursor-pointer",
        isSelected && "bg-gray-50 dark:bg-gray-800",
      )}
      onClick={() => onTaskSelect(task)}
      onDoubleClick={() => onEditStart(task.id)}
    >
      <Checkbox
        checked={task.timeStage === "done"}
        onCheckedChange={() => onTaskComplete(task.id)}
        className="mt-1"
        onClick={(e) => e.stopPropagation()}
      />
      {isEditing ? (
        <InlineTaskEditor
          value={newTaskTitle}
          onChange={onTitleChange}
          onSave={() => onTitleUpdate(task.id, newTaskTitle)}
          onCancel={onEditCancel}
          className="flex-1"
        />
      ) : (
        <>
          <span
            className={cn(
              "text-sm flex-1",
              theme === "dark" ? "text-gray-200" : "text-gray-700",
              task.timeStage === "done" && "line-through opacity-50",
            )}
          >
            {task.title}
          </span>
          <div className="flex items-center gap-2 group-hover:opacity-100 opacity-0 transition-opacity duration-200">
            <TaskHoverCard task={task}>
              <InfoIcon
                size={16}
                className="text-gray-400 dark:text-slate-500 cursor-pointer hover:text-gray-600 dark:hover:text-slate-300"
                onClick={(e) => e.stopPropagation()}
              />
            </TaskHoverCard>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal
                    size={16}
                    className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditStart(task.id);
                  }}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask(task.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </div>
  );
};
