import { useState, useEffect } from "react";
import { NoteWithAuthor, Notebook } from "../types/note";
import { supabase } from "../utils/supabaseClient";
import { toast } from "react-hot-toast";

export const useNotes = () => {
  const [notes, setNotes] = useState<NoteWithAuthor[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNote, setSelectedNote] = useState<NoteWithAuthor | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load notes from Supabase
  const loadNotes = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notes")
        .select(
          `
          *,
          author:profiles!notes_author_fkey (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `,
        )
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotes(data || []);
    } catch (error) {
      console.error("Error loading notes:", error);
      toast.error("Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  };

  // Load notebooks from Supabase
  const loadNotebooks = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notebooks")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotebooks(data || []);
    } catch (error) {
      console.error("Error loading notebooks:", error);
      toast.error("Failed to load notebooks");
    }
  };

  // Create a new note
  const createNote = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const newNote = {
        type: "note" as const,
        title: "Untitled Note",
        content: "",
        labels: [],
        author_id: user.id,
        color_theme: "blue" as const,
        is_protected: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("notes")
        .insert(newNote)
        .select(
          `
          *,
          author:profiles!notes_author_fkey (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `,
        )
        .single();

      if (error) throw error;

      setNotes([data, ...notes]);
      setSelectedNote(data);
      toast.success("Note created successfully");
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
    }
  };

  // Update an existing note
  const updateNote = async (updatedNote: NoteWithAuthor) => {
    try {
      const { error } = await supabase
        .from("notes")
        .update({
          title: updatedNote.title,
          content: updatedNote.content,
          labels: updatedNote.labels,
          color_theme: updatedNote.color_theme,
          is_protected: updatedNote.is_protected,
          pin_hash: updatedNote.pin_hash,
          notebook_id: updatedNote.notebook_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedNote.id);

      if (error) throw error;

      setNotes(
        notes.map((note) => (note.id === updatedNote.id ? updatedNote : note)),
      );
      setSelectedNote(updatedNote);
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Failed to update note");
    }
  };

  // Delete a note
  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase.from("notes").delete().eq("id", noteId);

      if (error) throw error;

      setNotes(notes.filter((note) => note.id !== noteId));
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
      toast.success("Note deleted successfully");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note");
    }
  };

  // Load data on mount
  useEffect(() => {
    loadNotes();
    loadNotebooks();
  }, []);

  return {
    notes,
    notebooks,
    selectedNote,
    isLoading,
    setSelectedNote,
    createNote,
    updateNote,
    deleteNote,
  };
};
