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
          profiles (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `,
        )
        .eq("author", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to match NoteWithAuthor interface
      const transformedNotes =
        data?.map((note) => ({
          ...note,
          author: note.profiles,
          author_id: note.author,
        })) || [];

      setNotes(transformedNotes);
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
      if (!user) {
        console.error("No user found");
        return;
      }

      console.log("Loading notebooks for user:", user.id);

      // First, fetch notebooks
      const { data: notebooksData, error: notebooksError } = await supabase
        .from("notebooks")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (notebooksError) {
        console.error("Supabase error:", notebooksError);
        throw notebooksError;
      }

      console.log("Loaded notebooks:", notebooksData);

      // Transform the data to match our Notebook interface
      const transformedNotebooks =
        notebooksData?.map((notebook) => ({
          ...notebook,
          author: notebook.author_id,
          filter_criteria: notebook.filter_criteria || {},
          note_ids: notebook.note_ids || [],
          is_dynamic: notebook.is_dynamic || false,
        })) || [];

      setNotebooks(transformedNotebooks);
    } catch (error: any) {
      console.error("Error loading notebooks:", error);
      toast.error(
        `Failed to load notebooks: ${error.message || "Unknown error"}`,
      );
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
        author: user.id,
        color_theme: "blue" as const,
        is_protected: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // First insert the note
      const { data: insertedNote, error: insertError } = await supabase
        .from("notes")
        .insert(newNote)
        .select()
        .single();

      if (insertError) throw insertError;

      // Then fetch the author details
      const { data: authorData, error: authorError } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, avatar_url")
        .eq("id", user.id)
        .single();

      if (authorError) throw authorError;

      // Combine note and author data
      const noteWithAuthor: NoteWithAuthor = {
        ...insertedNote,
        author: authorData,
        author_id: insertedNote.author,
      };

      setNotes([noteWithAuthor, ...notes]);
      setSelectedNote(noteWithAuthor);
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
      toast.success("Note updated successfully");
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
    const loadData = async () => {
      try {
        await Promise.all([loadNotes(), loadNotebooks()]);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
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
