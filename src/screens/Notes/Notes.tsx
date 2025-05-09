import React, { useState } from "react";
import { Sidebar } from "../../components/Sidebar";
import { TasksHeader } from "../../components/TasksHeader";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Theme, getInitialTheme } from "../../utils/theme";
import { cn } from "../../lib/utils";
import { StickyNote, Search } from "lucide-react";
import { NoteCard } from "../../components/NoteCard";
import { useNotes } from "../../hooks/useNotes";
import { NotePropertySheet } from "../../modules/notes/partials/NotePropertySheet";

/**
 * Notes Screen Component
 *
 * This component serves as the main interface for managing notes. It provides functionality for:
 * - Viewing a list of notes
 * - Creating new notes
 * - Searching through notes
 * - Selecting and editing notes
 * - Managing note properties
 */
export const Notes: React.FC = () => {
  // Local state
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [searchQuery, setSearchQuery] = useState("");

  // Custom hook for notes management
  const {
    notes,
    notebooks,
    selectedNote,
    isLoading,
    setSelectedNote,
    createNote,
    updateNote,
    deleteNote,
  } = useNotes();

  // Filter notes based on search query
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
      {/* Sidebar */}
      <Sidebar
        isSidebarExpanded={isSidebarExpanded}
        theme={theme}
        onToggleSidebar={() => setIsSidebarExpanded(!isSidebarExpanded)}
        onToggleTheme={() =>
          setTheme((current) => (current === "dark" ? "light" : "dark"))
        }
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <TasksHeader
          title="Notes"
          icon={<StickyNote />}
          theme={theme}
          onAddItem={createNote}
          addItemLabel="New Note"
        />

        <div className="flex">
          <div className="p-6 w-full h-full">
            {/* Search Bar */}
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

            {/* Notes Grid */}
            <div className="flex-1 overflow-y-auto mt-4 h-full w-full">
              {isLoading ? (
                // Loading State
                <div className="flex items-center justify-center h-full w-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : filteredNotes.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <StickyNote className="h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" />
                  <p className="text-gray-500 dark:text-slate-400">
                    No notes found
                  </p>
                  <Button
                    variant="outline"
                    onClick={createNote}
                    className="mt-4"
                  >
                    Create Note
                  </Button>
                </div>
              ) : (
                // Notes Grid
                <div className="space-y-2 flex flex-wrap gap-4">
                  {filteredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isSelected={selectedNote?.id === note.id}
                      theme={theme}
                      onSelect={setSelectedNote}
                      onDelete={deleteNote}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Note Property Sheet */}
          {/* {selectedNote && (
            <NoteSheet
              item={selectedNote}
              onClose={() => setSelectedNote(null)}
              onUpdate={updateNote}
              theme={theme}
              notebooks={notebooks}
            />
          )} */}
          {selectedNote && (
            <NotePropertySheet
              item={selectedNote}
              onClose={() => setSelectedNote(null)}
              onUpdate={updateNote}
              theme={theme}
              notebooks={notebooks}
            />
          )}
        </div>
      </div>
    </div>
  );
};
