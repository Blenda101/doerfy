import React from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { StoryWithRelations } from "../types/story";
import { cn } from "../lib/utils";
import { Theme } from "../utils/theme";
import { Info, MoreHorizontal } from "lucide-react";
import { StoryHoverCard } from "./StoryHoverCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import useEditorContent from "../hooks/useEditorContent";

interface StoryCardProps {
  story: StoryWithRelations;
  theme?: Theme;
  onView: (story: StoryWithRelations) => void;
  onDuplicate: (story: StoryWithRelations) => void;
  onDelete: (story: StoryWithRelations) => void;
  onFilterByChildren?: (storyId: string) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  story,
  theme = "light",
  onView,
  onDuplicate,
  onDelete,
  onFilterByChildren,
}) => {
  const content = useEditorContent(story.vision || story.description, theme);
  const getTypeIcon = () => {
    switch (story.type) {
      case "theme":
        return "🎯";
      case "mega_do":
        return "📋";
      case "project":
        return "📁";
      case "todo":
        return "✓";
      default:
        return "📄";
    }
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-all duration-200 cursor-pointer group",
        "hover:shadow-lg hover:scale-[1.02]",
        theme === "dark"
          ? "bg-slate-800 border-slate-700 hover:border-slate-600"
          : "bg-white border-gray-200 hover:border-gray-300",
      )}
      onClick={() => onView(story)}
    >
      <h3
        className={cn(
          "text-lg font-semibold mb-2 flex items-center",
          theme === "dark" ? "text-white" : "text-gray-900",
        )}
      >
        <span className="text-2xl mr-2">{getTypeIcon()}</span>
        {story.title || "Untitled"}
      </h3>

      <div
        dangerouslySetInnerHTML={{ __html: content }}
        className={cn(
          "text-sm mb-3 min-h-12",
          theme === "dark" ? "text-slate-300" : "text-gray-600",
        )}
      />
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center space-x-2">
          {story.labels.map((label) => (
            <Badge key={label} variant="secondary">
              {label}
            </Badge>
          ))}
        </div>
        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <StoryHoverCard story={story}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 text-theme-light text-sm"
            >
              <Info className="h-4 w-4 text-gray-400" />
            </Button>
          </StoryHoverCard>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 text-theme-light text-sm"
            onClick={(e) => {
              e.stopPropagation();
              onFilterByChildren?.(story.id);
            }}
          >
            ({story.childCount || 0})
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 m-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onView(story);
                }}
              >
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(story);
                }}
              >
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(story);
                }}
                className="text-red-600 dark:text-red-400"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};
