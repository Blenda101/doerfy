import React, { useState, useEffect } from "react";
import { Sidebar } from "../../components/Sidebar";
import { TasksHeader } from "../../components/TasksHeader";
import { NotePropertySheet } from "../../modules/notes/partials/NotePropertySheet";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { NoteWithAuthor, Notebook } from "../../types/note";
import { Theme, getInitialTheme } from "../../utils/theme";
import { supabase } from "../../utils/supabaseClient";
import { cn } from "../../lib/utils";
import { StickyNote, Search, MoreHorizontal, Trash2, Lock } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { colorVariants } from "../../data/map";

export const Notes: React.FC = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [notes, setNotes] = useState<NoteWithAuthor[]>([]);
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [selectedNote, setSelectedNote] = useState<NoteWithAuthor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadNotes();
    loadNotebooks();
  }, []);

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
        .eq("author", user.id)
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

  const handleNoteUpdate = async (updatedNote: NoteWithAuthor) => {
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

  const handleNoteDelete = async (noteId: string) => {
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

  const handleNewNote = async () => {
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

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div
      className={cn(
        "flex h-screen w-full",
        theme === "dark" ? "dark bg-[#0F172A]" : "bg-white",
      )}
    >
      <Sidebar
        isSidebarExpanded={isSidebarExpanded}
        theme={theme}
        onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        onToggleTheme={() =>
          setTheme((current) => (current === "dark" ? "light" : "dark"))
        }
      />

      <div className="flex-1 flex flex-col">
        <TasksHeader
          title="Notes"
          icon={<StickyNote />}
          theme={theme}
          onAddItem={handleNewNote}
          addItemLabel="New Note"
        />
        <div className="flex">
          <div className="p-6 w-full h-full">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500" />
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  "pl-10",
                  theme === "dark" && "bg-slate-800 border-slate-700",
                )}
              />
            </div>

            <div className="flex-1 overflow-y-auto mt-4  h-full w-full">
              {isLoading ? (
                <div className="flex items-center justify-center h-full w-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <StickyNote className="h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" />
                  <p className="text-gray-500 dark:text-slate-400">
                    No notes found
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleNewNote}
                    className="mt-4"
                  >
                    Create Note
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 flex flex-wrap gap-4">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className={cn(
                        "p-4 rounded-lg cursor-pointer transition-all duration-200 w-72 h-48",
                        colorVariants[note.color_theme],
                        "shadow-sm border",
                        selectedNote?.id === note.id && "shadow-lg border-4",
                        " dark:border-slate-600",
                      )}
                      onClick={() => setSelectedNote(note)}
                    >
                      <div className="flex items-center justify-between">
                        <h3
                          className={cn(
                            "font-medium truncate flex-1",
                            theme === "dark" ? "text-white" : "text-gray-900",
                          )}
                        >
                          {note.title || "Untitled Note"}
                        </h3>
                        {note.is_protected && (
                          <Lock className="w-4 h-4 text-purple-500 ml-2" />
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-sm line-clamp-2 mt-1",
                          theme === "dark" ? "text-slate-300" : "text-gray-600",
                        )}
                      >
                        {note.content.replace(/<[^>]*>/g, "")}
                      </p>
                      {note.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {note.labels.map((label) => (
                            <Badge
                              key={label}
                              variant="secondary"
                              className={theme === "dark" ? "bg-slate-600" : ""}
                            >
                              {label}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <span
                          className={cn(
                            "text-xs",
                            theme === "dark"
                              ? "text-slate-400"
                              : "text-gray-500",
                          )}
                        >
                          {new Date(note.updated_at).toLocaleDateString()}
                        </span>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-600 dark:text-red-400"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleNoteDelete(note.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* <div className="flex-1 flex flex-col overflow-hidden">
            {selectedNote ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-6 flex-1 overflow-y-auto">
                  <Input
                    value={selectedNote.title}
                    onChange={(e) => handleNoteUpdate({ ...selectedNote, title: e.target.value })}
                    className={cn(
                      "text-xl font-semibold mb-6 border-none p-0 focus-visible:ring-0 w-full",
                      theme === 'dark' && "bg-transparent text-white"
                    )}
                    placeholder="Untitled Note"
                  />
                  <div className="w-full">
                    <NoteEditor
                      content={selectedNote.content}
                      onChange={(content) => handleNoteUpdate({ ...selectedNote, content })}
                      theme={theme}
                      config={{
                        placeholder: 'Start writing...',
                        autofocus: true,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <StickyNote className="h-16 w-16 text-gray-400 dark:text-slate-500 mb-4" />
                <p className={cn(
                  "text-lg mb-4",
                  theme === 'dark' ? "text-slate-400" : "text-gray-500"
                )}>
                  Select a note to view or edit
                </p>
                <Button
                  onClick={handleNewNote}
                  className={theme === 'dark' && "bg-purple-600 hover:bg-purple-700"}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Note
                </Button>
              </div>
            )}
          </div> */}

          {selectedNote && (
            <NotePropertySheet
              item={selectedNote}
              onClose={() => setSelectedNote(null)}
              onUpdate={handleNoteUpdate}
              theme={theme}
              notebooks={notebooks}
            />
          )}
        </div>
      </div>
    </div>
  );
};
