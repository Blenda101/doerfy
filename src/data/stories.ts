import { StoryType } from "../types/story";

// Story type options configuration
export interface StoryOption {
  value: StoryType;
  emoji: string;
  title: string;
  description: string;
}

export const STORY_OPTIONS: StoryOption[] = [
  {
    value: "theme",
    emoji: "🎯",
    title: "Theme",
    description:
      "Define your vision, mission and goals here. The theme will ultimately guide your work and gives it meaning.",
  },
  {
    value: "mega_do",
    emoji: "📋",
    title: "Mega Do",
    description:
      "Create a major initiative that connects goals to concrete projects and measurable outcomes.",
  },
  {
    value: "project",
    emoji: "📁",
    title: "Project",
    description:
      "Coordinate resources and effort toward a specific outcome. Organizes related tasks and tracks progress.",
  },
  {
    value: "todo",
    emoji: "✓",
    title: "Todo",
    description:
      "Frame stories from the perspective of what users want to do, so that actionable units of work can be generated in the form of Task.",
  },
];
