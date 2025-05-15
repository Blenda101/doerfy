import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { LabelEditor } from "./LabelEditor";
import { Story, StoryType } from "../types/story";
import { cn } from "../lib/utils";
import { Theme } from "../utils/theme";
import {
  Calendar,
  InfoIcon,
} from "lucide-react";


import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Editor } from "./forms/Editor";
import { Sheet } from "./Sheet";
import { EditableTitle } from "./forms/EditableTitle";
import { EditableProperty } from "./EditableProperty";
import useStories from "../hooks/useStories";

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
}) => {
  const { stories } = useStories(getParentType(story.type));
  const handleUpdate = (updates: Partial<Story>) => {
    onUpdate({
      ...story,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <Sheet
      title={`About ${getStoryTypeLabel(story.type)}`}
      icon={<InfoIcon className="w-5 h-5" />}
      onClose={onClose}
      theme={theme}
    >
      {/* Story Parent Selection */}

      {story.type !== "theme" && (
        <div className="flex justify-center">
          <EditableProperty
            label=""
            placeholder="Select Parent"
            value={story.parentId!}
            options={stories.map((story) => ({
              value: story.id,
              label: story.title,
            }))}
            onChange={(parentId) => handleUpdate({ parentId })}
            disabled={stories.length === 0}
          />
        </div>
      )}
      {/* Story Title */}
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

function getParentType(storyType: StoryType): StoryType | null {
  switch (storyType) {
    case "mega_do":
      return "theme";
    case "project":
      return "mega_do";
    case "todo":
      return "project";
    default:
      return null;
  }
}

const getStoryTypeLabel = (type: StoryType) => {
  switch (type) {
    case "mega_do":
      return "Mega Do";
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
};
