import React from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "../lib/utils";
import { Theme } from "../utils/theme";
import {
  Search,
  MoreHorizontal,
  Plus,
  SlidersHorizontal,
  ListIcon,
} from "lucide-react";

interface TasksHeaderProps {
  title: string;
  icon: React.ReactNode;
  onAddItem?: () => void;
  addItemLabel?: string;
  theme?: Theme;
  tabs?: React.ReactNode;
  isAddListOpen?: boolean;
  setIsAddListOpen?: (open: boolean) => void;
  onFilterClick?: () => void;
}

export const TasksHeader: React.FC<TasksHeaderProps> = ({
  title,
  icon,
  onAddItem,
  theme = "light",
  tabs,
  isAddListOpen,
  setIsAddListOpen,
  onFilterClick,
}) => {
  return (
    <div
      className={cn(
        "h-16 min-h-[64px] border-b flex items-center px-6",
        theme === "dark" ? "border-[#334155] bg-[#0F172A]" : "border-gray-200",
      )}
    >
      <div className="flex items-center">
        {React.cloneElement(icon as React.ReactElement, {
          className: cn(
            "w-6 h-6 mr-3",
            theme === "dark" ? "text-[#8B5CF6]" : "text-[#5036b0]",
          ),
        })}
        <span
          className={cn(
            "text-xl font-light",
            theme === "dark" ? "text-gray-300" : "text-gray-600",
          )}
        >
          {title}
        </span>
      </div>
      <div className="flex-1 flex justify-center">{tabs}</div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={onFilterClick}
        >
          <SlidersHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <MoreHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {setIsAddListOpen && (
              <DropdownMenuItem onClick={() => setIsAddListOpen(true)}>
                <ListIcon className="w-4 h-4 mr-2" />
                Add List
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {onAddItem && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onAddItem}
            className="h-10 w-10 rounded-full bg-[#5036b0] dark:bg-[#8B5CF6] hover:bg-[#3a2783] dark:hover:bg-[#7C3AED]"
          >
            <Plus className="w-5 h-5 text-white" />
          </Button>
        )}
      </div>
    </div>
  );
};
