import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LabelEditor } from "./LabelEditor";
import { Story, StoryType } from "../types/story";
import { cn } from "../lib/utils";
import { Theme } from "../utils/theme";
import {
  X,
  ChevronDown,
  Calendar,
  BookOpen,
  Target,
  ClipboardList,
  Folder,
  CheckSquare,
  InfoIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Editor } from "./forms/Editor";
import { Sheet } from "./Sheet";
import { EditableTitle } from "./forms/EditableTitle";

interface StoryPanelProps {
  story: Story;
  onClose: () => void;
  onUpdate: (story: Story) => void;
  theme?: Theme;
  availableParents?: Story[];
}

export const StoryPanel: React.FC<StoryPanelProps> = ({
  story,
  onClose,
  onUpdate,
  theme = "light",
  availableParents = [],
}) => {
  const handleUpdate = (updates: Partial<Story>) => {
    onUpdate({
      ...story,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  const getStoryTypeIcon = (type: StoryType) => {
    switch (type) {
      case "theme":
        return <Target className="w-6 h-6" />;
      case "mega_do":
        return <ClipboardList className="w-6 h-6" />;
      case "project":
        return <Folder className="w-6 h-6" />;
      case "todo":
        return <CheckSquare className="w-6 h-6" />;
      default:
        return <BookOpen className="w-6 h-6" />;
    }
  };

  const getStoryTypeLabel = (type: StoryType) => {
    switch (type) {
      case "mega_do":
        return "Mega Do";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <Sheet
      title={`About ${getStoryTypeLabel(story.type)}`}
      icon={<InfoIcon className="w-5 h-5" />}
      onClose={onClose}
      theme={theme}
    >
      {/* Story Type and ID Badge */}
      <div
        className={cn(
          "inline-flex items-center space-x-3 px-4 py-2 rounded-lg",
          theme === "dark" ? "bg-slate-700" : "bg-gray-50",
        )}
      >
        {getStoryTypeIcon(story.type)}
        <span
          className={cn(
            "font-mono text-sm",
            theme === "dark" ? "text-slate-300" : "text-gray-600",
          )}
        >
          {story.id}
        </span>
      </div>

      {/* Story Type and ID Badge */}
      <EditableTitle
        title={story.title}
        onTitleChange={(title) => handleUpdate({ title })}
        theme={theme}
      />

      <div className="space-y-6">
        {story.type === "theme" && (
          <>
            <div>
              <Label>Vision</Label>
              <Editor
                content={story.vision || ""}
                onChange={(content) => handleUpdate({ vision: content })}
              />
            </div>
            <div>
              <Label>Mission</Label>
              <Editor
                content={story.mission || ""}
                onChange={(content) => handleUpdate({ mission: content })}
              />
            </div>
            <div>
              <Label>Goals</Label>
              <Editor
                content={story.goals?.join("\n") || ""}
                onChange={(content) =>
                  handleUpdate({
                    goals: content.split("\n").filter(Boolean),
                  })
                }
              />
            </div>
          </>
        )}

        {(story.type === "mega_do" ||
          story.type === "project" ||
          story.type === "todo") && (
          <>
            <div>
              <Label>Parent</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-between",
                      theme === "dark" &&
                        "bg-slate-700 border-slate-600 text-white",
                    )}
                  >
                    {story.parentId
                      ? availableParents.find((p) => p.id === story.parentId)
                          ?.title || "Select Parent"
                      : "Select Parent"}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full">
                  {availableParents.map((parent) => (
                    <DropdownMenuItem
                      key={parent.id}
                      onClick={() => handleUpdate({ parentId: parent.id })}
                    >
                      {parent.title}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div>
              <Label>Story</Label>
              <Editor
                content={story.description}
                onChange={(content) => handleUpdate({ description: content })}
              />
            </div>

            <div>
              <Label>What Does Done Look Like?</Label>
              <Editor
                content={story.whatDoneLooksLike || ""}
                onChange={(content) =>
                  handleUpdate({ whatDoneLooksLike: content })
                }
              />
            </div>

            {story.type !== "todo" && (
              <div>
                <Label>Due Date</Label>
                <div className="relative">
                  <DatePicker
                    selected={story.dueDate ? new Date(story.dueDate) : null}
                    onChange={(date) =>
                      handleUpdate({
                        dueDate: date ? date.toISOString() : null,
                      })
                    }
                    customInput={
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start",
                          theme === "dark" &&
                            "bg-slate-700 border-slate-600 text-white",
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {story.dueDate
                          ? new Date(story.dueDate).toLocaleDateString()
                          : "Select date"}
                      </Button>
                    }
                  />
                </div>
              </div>
            )}

            {story.type === "todo" && (
              <div>
                <Label>Effort Estimate</Label>
                <Input
                  type="number"
                  value={story.effortEstimate || ""}
                  onChange={(e) =>
                    handleUpdate({
                      effortEstimate: parseInt(e.target.value) || null,
                    })
                  }
                  className={cn(
                    theme === "dark" &&
                      "bg-slate-700 border-slate-600 text-white",
                  )}
                />
              </div>
            )}
          </>
        )}

        <div>
          <LabelEditor
            labels={story.labels}
            onChange={(labels) => handleUpdate({ labels })}
          />
        </div>
      </div>
    </Sheet>
  );
};
