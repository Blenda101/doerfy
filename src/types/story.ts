export type StoryType = 'theme' | 'mega_do' | 'project' | 'todo';
export type StoryStatus = 'active' | 'completed';

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