import { Database } from "./supabase";

export type ColorTheme = "blue" | "green" | "purple" | "red" | "yellow";

export interface Note {
  id: string;
  type: "note";
  title: string;
  content: string;
  labels: string[];
  author: string;
  color_theme: ColorTheme;
  is_protected: boolean;
  pin_hash: string | null;
  created_at: string;
  updated_at: string;
  notebook_id: string | null;
}

export interface Notebook {
  id: string;
  type: "notebook";
  title: string;
  description: string;
  labels: string[];
  color_theme: ColorTheme;
  is_dynamic: boolean;
  filter_criteria?: FilterCriteria;
  note_ids?: string[];
  is_protected: boolean;
  pin_hash: string | null;
  created_at: string;
  updated_at: string;
  author: string;
}

export interface FilterCriteria {
  labels?: string[];
  color_themes?: ColorTheme[];
  created_after?: string;
  created_before?: string;
  updated_after?: string;
  updated_before?: string;
  text_search?: string;
  author_ids?: string[];
}

export type NoteType = Note | Notebook;

export interface NoteWithAuthor extends Note {
  author_profile: Database["public"]["Tables"]["profiles"]["Row"];
}

export interface NotebookWithAuthor extends Notebook {
  author_profile: Database["public"]["Tables"]["profiles"]["Row"];
}

export type NoteTypeWithAuthor = NoteWithAuthor | NotebookWithAuthor;

export interface NoteEditorConfig {
  placeholder?: string;
  autofocus?: boolean;
  editable?: boolean;
}

export interface NotePinConfig {
  isProtected: boolean;
  pinHash: string | null;
  blurContent: boolean;
}

export interface NoteMetadata {
  wordCount: number;
  characterCount: number;
  readingTime: number;
}