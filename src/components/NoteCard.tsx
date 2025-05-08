import React from "react";
import { NoteWithAuthor } from "../types/note";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MoreHorizontal, Lock, Trash2 } from "lucide-react";
import { cn } from "../lib/utils";
import { Theme } from "../utils/theme";
import { colorVariants } from "../data/map";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface NoteCardProps {
  note: NoteWithAuthor;
  isSelected: boolean;
  theme: Theme;
  onSelect: (note: NoteWithAuthor) => void;
  onDelete: (noteId: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  isSelected,
  theme,
  onSelect,
  onDelete,
}) => {
  // Handle click event without propagation for dropdown
  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg cursor-pointer transition-all duration-200 w-72 h-48",
        colorVariants[note.color_theme],
        "shadow-sm border",
        isSelected && "shadow-lg border-4",
        theme === "dark" ? "dark:border-slate-600" : "border-gray-200",
      )}
      onClick={() => onSelect(note)}
    >
      <div className="flex items-center justify-between">
        <h3
          className={cn(
            "font-medium truncate flex-1",
            theme === "dark" ? "text-white" : "text-gray-900",
          )}
        >
          {note.title || "Untitled Note"}
        </h3>
        {note.is_protected && <Lock className="w-4 h-4 text-purple-500 ml-2" />}
      </div>

      <p
        className={cn(
          "text-sm line-clamp-2 mt-1",
          theme === "dark" ? "text-slate-300" : "text-gray-600",
        )}
      >
        {note.content.replace(/<[^>]*>/g, "")}
      </p>

      {note.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {note.labels.map((label) => (
            <Badge
              key={label}
              variant="secondary"
              className={theme === "dark" ? "bg-slate-600" : ""}
            >
              {label}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <span
          className={cn(
            "text-xs",
            theme === "dark" ? "text-slate-400" : "text-gray-500",
          )}
        >
          {new Date(note.updated_at).toLocaleDateString()}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={handleDropdownClick}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-red-600 dark:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
