import { Database } from "./supabase";

export type StoryType = "theme" | "mega_do" | "project" | "todo";
export type StoryStatus = "active" | "completed";

export interface Story {
  id: string;
  title: string;
  description: string;
  type: StoryType;
  parentId?: string | null;
  vision?: string | null;
  mission?: string | null;
  goals?: string[];
  whatDoneLooksLike?: string | null;
  dueDate?: string | null;
  effortEstimate?: number | null;
  status: StoryStatus;
  labels: string[];
  assignee: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface StoryWithRelations extends Story {
  parent?: Story | null;
  children?: Story[];
  childCount?: number;
}

export type StoryFromSupabase = Database["public"]["Tables"]["stories"]["Row"];

export const mapStoryFromSupabase = (story: StoryFromSupabase): Story => {
  return {
    ...story,
    createdAt: story.created_at || "",
    updatedAt: story.updated_at || "",
    createdBy: story.created_by || "",
    description: story.description || "",
    vision: story.vision || "",
    mission: story.mission || "",
    goals: (story.goals as string[]) || [],
    whatDoneLooksLike: story.what_done_looks_like || "",
    dueDate: story.due_date || "",
    effortEstimate: story.effort_estimate || null,
    assignee: story.assignee || "",
    labels: (story.labels as string[]) || [],
    status: story.status as StoryStatus,
    type: story.type as StoryType,
    parentId: story.parent_id || null,
  };
};

export const mapStoryToSupabase = (story: Story): StoryFromSupabase => {
  return {
    id: story.id,
    title: story.title,
    description: story.description,
    vision: story.vision || null,
    mission: story.mission || null,
    goals: story.goals || [],
    what_done_looks_like: story.whatDoneLooksLike || null,
    due_date: story.dueDate || null,
    effort_estimate: story.effortEstimate || null,
    assignee: story.assignee,
    labels: story.labels,
    status: story.status,
    type: story.type,
    parent_id: story.parentId || null,
    created_by: story.createdBy,
    created_at: story.createdAt,
    updated_at: story.updatedAt,
  };
};
