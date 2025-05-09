import React from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Plus } from "lucide-react";
import { cn } from "../lib/utils";
import { Theme } from "../utils/theme";

interface ListHeaderProps {
  listId: string;
  listName: string;
  taskCount: number;
  theme: Theme;
  isActive: boolean;
  onListClick: (listId: string) => void;
  onAddTask: () => void;
}

export const ListHeader: React.FC<ListHeaderProps> = ({
  listId,
  listName,
  taskCount,
  theme,
  isActive,
  onListClick,
  onAddTask,
}) => {
  return (
    <div className="flex items-center border-b pb-4 dark:border-slate-700">
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
    </div>
  );
};
