import React, { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import {
  MoreHorizontalIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EditIcon,
  InfoIcon,
  Trash2Icon,
} from "lucide-react";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Task } from "../types/task";
import {
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TimeBoxDialog, TimeBoxConfig } from "./TimeBoxDialog";
import { TaskHoverCard } from "./TaskHoverCard";
import { InlineTaskEditor } from "./InlineTaskEditor";
import { cn } from "../lib/utils";
import { validateTaskTitle } from "../utils/taskUtils";

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
}

interface DraggableTaskProps {
  task: Task;
  isEditing: boolean;
  onTaskSelect?: (task: Task) => void;
  onTaskTitleUpdate?: (taskId: string, title: string) => void;
  onTaskDelete?: (taskId: string) => void;
  getTaskColor: (icon: string) => string;
}

const DraggableTask: React.FC<DraggableTaskProps> = ({
  task,
  isEditing,
  onTaskSelect,
  onTaskTitleUpdate,
  onTaskDelete,
  getTaskColor,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const clickTimeout = useRef<number | null>(null);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.id,
      data: task,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging ? "grabbing" : "pointer",
  };

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      setIsDragging(true);
    }, 150);

    const handleMouseUp = () => {
      clearTimeout(timer);
      setIsDragging(false);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleSave = () => {
    const validatedTitle = validateTaskTitle(editValue);
    onTaskTitleUpdate?.(task.id, validatedTitle);
  };

  const handleCancel = () => {
    setEditValue(task.title);
    onTaskTitleUpdate?.(task.id, task.title);
  };

  const handleClick = () => {
    if (clickTimeout.current !== null) {
      // double click happened before timeout
      window.clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }

    // set timeout for single click
    clickTimeout.current = window.setTimeout(() => {
      if (!isEditing && !isDragging) {
        onTaskSelect?.(task);
      }
      clickTimeout.current = null;
    }, 250); // delay enough to allow for double click
  };

  const handleDoubleClick = () => {
    if (clickTimeout.current !== null) {
      window.clearTimeout(clickTimeout.current); // cancel single click
      clickTimeout.current = null;
    }
    onTaskTitleUpdate?.(task.id, task.title);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "flex items-start mb-3 last:mb-0 relative p-1 rounded group group/options transition-colors duration-200 cursor-pointer",
        "hover:bg-gray-50 dark:hover:bg-slate-700",
        isDragging && "opacity-50 cursor-grabbing",
        task.agingStatus === "warning" && "bg-yellow-50 dark:bg-yellow-900/20",
        task.agingStatus === "overdue" && "bg-red-50 dark:bg-red-900/20",
      )}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className={`${getTaskColor(task.icon)} text-sm mr-2`}>●</div>
      {isEditing ? (
        <InlineTaskEditor
          value={editValue}
          onChange={setEditValue}
          onSave={handleSave}
          onCancel={handleCancel}
          className="flex-1"
        />
      ) : (
        <>
          <span
            className={cn(
              "text-sm flex-grow ",
              task.agingStatus === "overdue" &&
                "text-red-500 dark:text-red-400",
              task.agingStatus === "warning" &&
                "text-yellow-600 dark:text-yellow-400",
              "dark:text-slate-200",
            )}
          >
            {task.title} {task.status && `(${task.status})`}
          </span>
          {/* {isHovered && !isDragging && ( */}
          <div className="flex items-center gap-2 ml-2">
            <TaskHoverCard task={task}>
              <InfoIcon
                size={16}
                className="text-gray-400 dark:text-slate-500 cursor-pointer hover:text-gray-600 dark:hover:text-slate-300 w-0 opacity-0 group-hover/options:opacity-100 group-hover/options:w-6"
              />
            </TaskHoverCard>
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-6 p-0 ${
                    !isMenuOpen ? "w-0 opacity-0" : "w-6 opacity-100"
                  } group-hover/options:opacity-100 group-hover/options:w-6`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontalIcon
                    size={16}
                    className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="z-[100]"
                style={{ position: "relative" }}
              >
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskTitleUpdate?.(task.id, task.title);
                  }}
                >
                  <EditIcon className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 dark:text-red-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskDelete?.(task.id);
                  }}
                >
                  <Trash2Icon className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* )} */}
        </>
      )}
    </div>
  );
};

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
            <ChevronDownIcon
              className={cn(
                "text-lg",
                "text-gray-500 dark:text-slate-300",
                "group-hover:text-[#5036b0] dark:group-hover:text-purple-400",
              )}
            />
          ) : (
            <ChevronUpIcon
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
          {title} {expireThreshold !== undefined ? `(${expireThreshold})` : ""}
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
          <PlusIcon
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
              <MoreHorizontalIcon
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
              <EditIcon className="w-4 h-4 mr-2" />
              Edit Time Box
            </DropdownMenuItem>
            {canMoveUp && (
              <DropdownMenuItem
                onClick={() => onTimeBoxMove?.(timeStage, "up")}
              >
                <ArrowUpIcon className="w-4 h-4 mr-2" />
                Move Up
              </DropdownMenuItem>
            )}
            {canMoveDown && (
              <DropdownMenuItem
                onClick={() => onTimeBoxMove?.(timeStage, "down")}
              >
                <ArrowDownIcon className="w-4 h-4 mr-2" />
                Move Down
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator className={cn("mb-4", "dark:border-slate-700")} />

      {isExpanded && (
        <SortableContext
          items={visibleTasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
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
                      <DraggableTask
                        key={task.id}
                        task={task}
                        isEditing={task.id === editingTaskId}
                        onTaskSelect={onTaskSelect}
                        onTaskTitleUpdate={onTaskTitleUpdate}
                        onTaskDelete={onTaskDelete}
                        getTaskColor={getTaskColor}
                      />
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
        </SortableContext>
      )}

      <TimeBoxDialog
        isOpen={isEditTimeBoxOpen}
        onClose={() => setIsEditTimeBoxOpen(false)}
        onSave={handleTimeBoxSave}
        initialConfig={{
          id: timeStage,
          name: title,
          description: "",
          warnThreshold: undefined,
          expireThreshold: expireThreshold,
        }}
      />
    </div>
  );
};
