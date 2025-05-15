import React from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { cn } from "../lib/utils";
import { Theme } from "../utils/theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface ListHeaderProps {
  listId: string;
  listName: string;
  taskCount: number;
  theme: Theme;
  isActive: boolean;
  onListClick: (listId: string) => void;
  onAddTask: () => void;
  onEditList: () => void;
  onDeleteList: (listId: string) => void;
}

export const ListHeader: React.FC<ListHeaderProps> = ({
  listId,
  listName,
  taskCount,
  theme,
  isActive,
  onListClick,
  onAddTask,
  onEditList,
  onDeleteList,
}) => {
  return (
    <div className="flex items-center border-b pb-4 dark:border-slate-700 pl-[5px] pr-[9px]">
      <div
        className="flex items-center flex-1 cursor-pointer"
        onClick={() => onListClick(listId)}
      >
        <h2
          className={cn(
            "text-lg font-semibold capitalize",
            isActive
              ? theme === "dark"
                ? "text-[#8B5CF6]"
                : "text-[#5036b0]"
              : theme === "dark"
              ? "text-gray-200"
              : "text-gray-800",
          )}
        >
          {listName}
        </h2>
        <Badge
          className={cn(
            "ml-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
          )}
        >
          {taskCount}
        </Badge>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="ml-2 h-8 w-8"
        onClick={onAddTask}
      >
        <Plus className="w-4 h-4" />
      </Button>
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
              onEditList();
            }}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600 dark:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteList(listId);
            }}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
