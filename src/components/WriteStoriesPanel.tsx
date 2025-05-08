import React from "react";
import { PencilLine } from "lucide-react";
import { cn } from "../lib/utils";
import { Theme } from "../utils/theme";
import { Button } from "./ui/button";
import { Sheet } from "./Sheet";
import { STORY_OPTIONS, StoryOption } from "../data/stories";

// Type definition for story types
type StoryType = "theme" | "mega_do" | "project" | "todo";

// Props interface for the WriteStoriesPanel component
interface WriteStoriesPanelProps {
  onClose: () => void;
  onSelect: (type: StoryType) => void;
  theme?: Theme;
}

/**
 * WriteStoriesPanel Component
 *
 * A panel that allows users to select the type of story they want to create.
 * Uses the Sheet component for consistent layout and styling.
 */
export const WriteStoriesPanel: React.FC<WriteStoriesPanelProps> = ({
  onClose,
  onSelect,
  theme = "light",
}) => {
  // Render a single story option as a button
  const renderStoryOption = (option: StoryOption) => (
    <Button
      key={option.value}
      variant="outline"
      onClick={() => onSelect(option.value)}
      className={cn(
        "w-full flex flex-col items-start space-y-2 p-4 h-auto text-wrap",
        "hover:bg-gray-50 dark:hover:bg-slate-700",
        "border",
        theme === "dark"
          ? "border-slate-700 hover:border-purple-600"
          : "border-gray-200 hover:border-purple-600",
      )}
    >
      <div className="flex items-center space-x-2 w-full">
        <span className="text-2xl">{option.emoji}</span>
        <span
          className={cn(
            "font-semibold",
            theme === "dark" ? "text-white" : "text-gray-900",
          )}
        >
          {option.title}
        </span>
      </div>
      <p
        className={cn(
          "text-sm text-left",
          theme === "dark" ? "text-gray-400" : "text-gray-500",
        )}
      >
        {option.description}
      </p>
    </Button>
  );

  return (
    <Sheet
      title="Write Stories"
      icon={<PencilLine className="w-5 h-5" />}
      onClose={onClose}
      theme={theme}
    >
      <h3
        className={cn(
          "text-lg mb-6",
          theme === "dark" ? "text-gray-300" : "text-gray-600",
        )}
      >
        What type of story would you like to write?
      </h3>

      <div className="space-y-4">{STORY_OPTIONS.map(renderStoryOption)}</div>
    </Sheet>
  );
};
