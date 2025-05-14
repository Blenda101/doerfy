import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { InlineTaskEditor } from "./InlineTaskEditor";
import { TimeBoxConfig } from "./TimeBoxDialog";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  MoreHorizontal,
  Plus,
  InfoIcon,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Task } from "../types/task";
import { cn } from "../lib/utils";
import { TaskHoverCard } from "./TaskHoverCard";
import { validateTaskTitle } from "../modules/tasks/lists/utils/taskUtils";

interface TaskColumnProps {
  title: string;
  count?: number;
  tasks: Task[];
  badgeCount?: number;
  defaultExpanded?: boolean;
  timeStage: Task["timeStage"];
  isActive?: boolean;
  editingTaskId?: string | null;
  isDraggingOver?: boolean;
  isValidDropTarget?: boolean;
  onTaskSelect?: (task: Task) => void;
  onNewTask?: (timeStage: Task["timeStage"], title: string) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskTitleUpdate?: (taskId: string, title: string) => void;
  onTimeBoxEdit?: (timeStage: Task["timeStage"], config: TimeBoxConfig) => void;
  onTimeBoxMove?: (
    timeStage: Task["timeStage"],
    direction: "up" | "down",
  ) => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  expireThreshold?: number;
  selectedTaskId?: string | null;
}

export const TaskColumn: React.FC<TaskColumnProps> = ({
  title,
  count,
  tasks,
  badgeCount = 0,
  defaultExpanded = true,
  timeStage,
  isActive = false,
  editingTaskId,
  isDraggingOver = false,
  isValidDropTarget = true,
  onTaskSelect,
  onNewTask,
  onTaskTitleUpdate,
  onTaskDelete,
  onTimeBoxEdit,
  onTimeBoxMove,
  canMoveUp = true,
  canMoveDown = true,
  expireThreshold,
}) => {
  const [showMore, setShowMore] = useState(false);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isEditTimeBoxOpen, setIsEditTimeBoxOpen] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        handleAddNewTask();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const getTaskColor = (icon: string) => {
    switch (icon) {
      case "purple":
        return "text-[#aa8ab8] dark:text-[#c4a6d1]";
      case "blue":
        return "text-[#759ce7] dark:text-[#90b3f9]";
      default:
        return "text-[#759ce7] dark:text-[#90b3f9]";
    }
  };

  const handleAddNewTask = () => {
    console.log("Creating new task for stage:", timeStage);
    setIsAddingTask(true);
  };

  const handleNewTaskSave = () => {
    const validatedTitle = validateTaskTitle(newTaskTitle);
    if (validatedTitle) {
      onNewTask?.(timeStage, validatedTitle);
    }
    setNewTaskTitle("");
    setIsAddingTask(false);
  };

  const handleNewTaskCancel = () => {
    setNewTaskTitle("");
    setIsAddingTask(false);
  };

  const handleTimeBoxSave = (config: TimeBoxConfig) => {
    onTimeBoxEdit?.(timeStage, config);
    setIsEditTimeBoxOpen(false);
  };

  const visibleTasks = showMore ? tasks : tasks.slice(0, 9);

  const renderTaskIndicators = (task: Task) => {
    const leadDays = task.schedule?.leadDays || 0;
    const durationDays = task.schedule?.durationDays || 0;

    return (
      <div className="flex items-center space-x-1 ml-2">
        {leadDays > 0 && (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 rounded-full px-2 py-0.5 text-xs"
          >
            {leadDays}d
          </Badge>
        )}
        {durationDays > 0 && (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-full px-2 py-0.5 text-xs"
          >
            {durationDays}d
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="mb-8">
      <div
        className="flex items-center mb-2"
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        <div
          className={cn(
            "rounded-full p-1 transition-colors duration-200 cursor-pointer w-8 h-8 flex items-center justify-center group",
            "hover:bg-gray-100 dark:hover:bg-slate-700",
          )}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronDown
              className={cn(
                "text-lg",
                "text-gray-500 dark:text-slate-300",
                "group-hover:text-[#5036b0] dark:group-hover:text-purple-400",
              )}
            />
          ) : (
            <ChevronUp
              className={cn(
                "text-lg",
                "text-gray-500 dark:text-slate-300",
                "group-hover:text-[#5036b0] dark:group-hover:text-purple-400",
              )}
            />
          )}
        </div>
        <h3
          className={cn(
            "font-black text-sm ml-4",
            isActive
              ? "text-[#5036b0] dark:text-purple-400"
              : "text-black dark:text-slate-300",
          )}
        >
          {title} {expireThreshold != null ? `(${expireThreshold})` : ""}
        </h3>
        <Badge
          className={cn(
            "ml-2 h-[18px] rounded-sm",
            "bg-[#d9d9d9] dark:bg-[#334155]",
            "text-black dark:text-slate-300",
          )}
        >
          <span className="font-light text-sm">{badgeCount}</span>
        </Badge>
        <div className="flex-grow" />
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "p-0 mr-2 rounded-full w-8 h-8 flex items-center justify-center group",
            "hover:bg-gray-100 dark:hover:bg-slate-700",
          )}
          onClick={handleAddNewTask}
        >
          <Plus
            className={cn(
              "text-xl group-hover:text-[#5036b0] dark:group-hover:text-purple-400",
              "text-gray-500 dark:text-slate-400",
            )}
          />
        </Button>
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "p-0 rounded-full w-8 h-8 flex items-center justify-center group",
                "hover:bg-gray-100 dark:hover:bg-slate-700",
                !isHeaderHovered && !isMenuOpen && "opacity-0",
              )}
            >
              <MoreHorizontal
                className={cn(
                  "h-4 w-4 group-hover:text-[#5036b0] dark:group-hover:text-purple-400",
                  "text-gray-500 dark:text-slate-400",
                )}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="z-[100]"
            style={{ position: "relative" }}
          >
            <DropdownMenuItem onClick={() => setIsEditTimeBoxOpen(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Time Box
            </DropdownMenuItem>
            {canMoveUp && (
              <DropdownMenuItem
                onClick={() => onTimeBoxMove?.(timeStage, "up")}
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                Move Up
              </DropdownMenuItem>
            )}
            {canMoveDown && (
              <DropdownMenuItem
                onClick={() => onTimeBoxMove?.(timeStage, "down")}
              >
                <ArrowDown className="w-4 h-4 mr-2" />
                Move Down
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isExpanded && (
        <div
          className={cn(
            "min-h-[100px] p-2 rounded-lg transition-colors duration-200",
            isDraggingOver &&
              isValidDropTarget &&
              "bg-gray-50 dark:bg-slate-800/50",
          )}
        >
          {isAddingTask && (
            <div className="flex items-center mb-4 px-1 w-1/3">
              <div
                className={cn(
                  "text-[#759ce7] dark:text-[#90b3f9] text-sm mr-2",
                )}
              >
                ●
              </div>
              <InlineTaskEditor
                value={newTaskTitle}
                onChange={setNewTaskTitle}
                onSave={handleNewTaskSave}
                onCancel={handleNewTaskCancel}
                className="flex-1"
              />
            </div>
          )}

          <div className="grid grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, colIndex) => (
              <div key={colIndex}>
                {visibleTasks
                  .filter((_, index) => index % 3 === colIndex)
                  .map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-start mb-3 last:mb-0 relative p-1 rounded group",
                        "hover:bg-gray-50 dark:hover:bg-slate-700",
                        task.agingStatus === "warning" &&
                          "bg-yellow-50 dark:bg-yellow-900/20",
                        task.agingStatus === "overdue" &&
                          "bg-red-50 dark:bg-red-900/20",
                      )}
                      onClick={() => onTaskSelect?.(task)}
                    >
                      <div
                        className={`${getTaskColor(task.icon)} text-sm mr-2`}
                      >
                        ●
                      </div>
                      {editingTaskId === task.id ? (
                        <InlineTaskEditor
                          value={task.title}
                          onChange={(value) =>
                            onTaskTitleUpdate?.(task.id, value)
                          }
                          onSave={() =>
                            onTaskTitleUpdate?.(task.id, task.title)
                          }
                          onCancel={() =>
                            onTaskTitleUpdate?.(task.id, task.title)
                          }
                          className="flex-1"
                        />
                      ) : (
                        <>
                          <div className="flex-1 group">
                            <div className="flex items-center">
                              <span
                                className={cn(
                                  "text-sm",
                                  task.agingStatus === "overdue" &&
                                    "text-red-500 dark:text-red-400",
                                  task.agingStatus === "warning" &&
                                    "text-yellow-600 dark:text-yellow-400",
                                  "dark:text-slate-200",
                                )}
                              >
                                {task.title}
                              </span>
                              {renderTaskIndicators(task)}
                            </div>
                            {task.status && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                ({task.status})
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-2 group-hover:opacity-100 opacity-0 transition-opacity duration-200">
                            <TaskHoverCard task={task}>
                              <InfoIcon
                                size={16}
                                className="text-gray-400 dark:text-slate-500 cursor-pointer hover:text-gray-600 dark:hover:text-slate-300"
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
                                    onTaskTitleUpdate?.(task.id, task.title);
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-red-600 dark:text-red-400"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onTaskDelete?.(task.id);
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
                  ))}
              </div>
            ))}
          </div>

          {tasks.length > 9 && (
            <Button
              variant="ghost"
              onClick={() => setShowMore(!showMore)}
              className={cn(
                "w-full mt-4",
                "text-[#6f6f6f] dark:text-slate-400",
                "hover:text-[#5036b0] dark:hover:text-purple-400",
              )}
            >
              {showMore ? "Show Less" : "Show More"}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
