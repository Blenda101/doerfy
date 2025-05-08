import React, { useState, useEffect } from "react";
import { Sidebar } from "../../components/Sidebar";
import { TasksHeader } from "../../components/TasksHeader";
import { StoryCard } from "../../components/StoryCard";
import { StoryTable } from "../../components/StoryTable";
import { StoryPanel } from "../../components/StoryPanel";
import { WriteStoriesPanel } from "../../components/WriteStoriesPanel";
import { Theme, getInitialTheme } from "../../utils/theme";
import { Story, StoryWithRelations } from "../../types/story";
import { supabase } from "../../utils/supabaseClient";
import { cn } from "../../lib/utils";
import { BookOpen, List } from "lucide-react";
import { toast } from "react-hot-toast";
import { Button } from "../../components/ui/button";
import ToggleButton from "../../components/ui/toggle";

export const Stories: React.FC = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [stories, setStories] = useState<StoryWithRelations[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isWriteStoriesOpen, setIsWriteStoriesOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [filterParent, setFilterParent] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    loadUser();
  }, []);

  useEffect(() => {
    const loadStories = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;

        const query = supabase
          .from("stories")
          .select("*")
          .or(`assignee.eq.${user.id},created_by.eq.${user.id}`);

        if (filterParent) {
          query.eq("parent_id", filterParent);
        }

        const { data: stories, error } = await query;

        if (error) throw error;

        // Load parent stories for filtered stories
        let parentIds = stories
          .filter((s) => s.parent_id)
          .map((s) => s.parent_id);

        const { data: parents } = await supabase
          .from("stories")
          .select("*")
          .in("id", parentIds);

        // Count children for each story
        const { data: childCounts, error: countError } = await supabase
          .from("stories")
          .select("parent_id")
          .not("parent_id", "is", null);

        if (countError) throw countError;

        // Create a map of parent IDs to child counts
        const childCountMap = (childCounts || []).reduce((acc, curr) => {
          acc[curr.parent_id] = (acc[curr.parent_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const storiesWithRelations = stories.map((story) => ({
          ...story,
          parent: parents?.find((p) => p.id === story.parent_id),
          childCount: childCountMap[story.id] || 0,
        }));

        setStories(storiesWithRelations);
      } catch (error) {
        console.error("Error loading stories:", error);
        toast.error("Failed to load stories");
      }
    };

    loadStories();
  }, [filterParent]);

  const handleStoryUpdate = async (updatedStory: Story) => {
    try {
      const { error } = await supabase
        .from("stories")
        .update({
          title: updatedStory.title,
          description: updatedStory.description,
          type: updatedStory.type,
          parent_id: updatedStory.parentId,
          vision: updatedStory.vision,
          mission: updatedStory.mission,
          goals: updatedStory.goals,
          what_done_looks_like: updatedStory.whatDoneLooksLike,
          due_date: updatedStory.dueDate,
          effort_estimate: updatedStory.effortEstimate,
          status: updatedStory.status,
          labels: updatedStory.labels,
          assignee: updatedStory.assignee,
          updated_at: new Date().toISOString(),
        })
        .eq("id", updatedStory.id);

      if (error) throw error;

      setStories(
        stories.map((story) =>
          story.id === updatedStory.id ? { ...story, ...updatedStory } : story,
        ),
      );

      toast.success("Story updated successfully");
    } catch (error) {
      console.error("Error updating story:", error);
      toast.error("Failed to update story");
    }
  };

  const handleStoryDelete = async (story: StoryWithRelations) => {
    try {
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", story.id);

      if (error) throw error;

      setStories(stories.filter((s) => s.id !== story.id));
      if (selectedStory?.id === story.id) {
        setSelectedStory(null);
      }

      toast.success("Story deleted successfully");
    } catch (error) {
      console.error("Error deleting story:", error);
      toast.error("Failed to delete story");
    }
  };

  const handleStoryDuplicate = async (story: StoryWithRelations) => {
    try {
      const newStory = {
        ...story,
        id: `${story.type.toUpperCase()}-${Math.floor(Math.random() * 10000)}`,
        title: `${story.title} (Copy)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("stories").insert(newStory);

      if (error) throw error;

      setStories([...stories, { ...newStory, childCount: 0 }]);
      toast.success("Story duplicated successfully");
    } catch (error) {
      console.error("Error duplicating story:", error);
      toast.error("Failed to duplicate story");
    }
  };

  const handleNewStory = async (type: Story["type"]) => {
    try {
      const newStory = {
        id: `${type.toUpperCase()}-${Math.floor(Math.random() * 10000)}`,
        title: "",
        description: "",
        type,
        status: "active" as const,
        labels: [],
        assignee: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: user.id,
      };

      const { error } = await supabase.from("stories").insert(newStory);

      if (error) throw error;

      const storyWithRelations = {
        ...newStory,
        childCount: 0,
        createdAt: newStory.created_at,
        updatedAt: newStory.updated_at,
        createdBy: newStory.created_by,
      };

      setStories([...stories, storyWithRelations]);
      setSelectedStory(storyWithRelations);
      setIsWriteStoriesOpen(false);
    } catch (error) {
      console.error("Error creating story:", error);
      toast.error("Failed to create story");
    }
  };

  return (
    <div
      className={cn(
        "flex h-screen",
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
          title="Stories"
          icon={<BookOpen />}
          theme={theme}
          onAddItem={() => setIsWriteStoriesOpen(true)}
          addItemLabel="Write Story"
          tabs={
            <ToggleButton
              size={24}
              options={[
                {
                  value: "grid",
                  label: "Grid",
                  icon: (
                    <BookOpen className="text-theme-light dark:text-theme-dark" />
                  ),
                },
                {
                  value: "list",
                  label: "List",
                  icon: (
                    <List className="text-theme-light dark:text-theme-dark" />
                  ),
                },
              ]}
              activeOption={view}
              onChange={(value) => setView(value as "grid" | "list")}
            />
          }
        />

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  {filterParent && (
                    <Button
                      variant="outline"
                      onClick={() => setFilterParent(null)}
                    >
                      Clear Filter
                    </Button>
                  )}
                </div>
              </div>

              {view === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stories.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      theme={theme}
                      onView={setSelectedStory}
                      onDuplicate={handleStoryDuplicate}
                      onDelete={handleStoryDelete}
                      onFilterByChildren={setFilterParent}
                    />
                  ))}
                </div>
              ) : (
                <StoryTable
                  stories={stories}
                  theme={theme}
                  onView={setSelectedStory}
                  onDuplicate={handleStoryDuplicate}
                  onDelete={handleStoryDelete}
                  onFilterByChildren={setFilterParent}
                />
              )}
            </div>
          </div>

          {selectedStory && (
            <div
              className={cn(
                "border-l",
                theme === "dark" ? "border-[#334155]" : "border-gray-200",
              )}
            >
              <StoryPanel
                story={selectedStory}
                onClose={() => setSelectedStory(null)}
                onUpdate={handleStoryUpdate}
                theme={theme}
                availableParents={stories.filter(
                  (s) =>
                    s.id !== selectedStory.id &&
                    ((selectedStory.type === "mega_do" && s.type === "theme") ||
                      (selectedStory.type === "project" &&
                        s.type === "mega_do") ||
                      (selectedStory.type === "todo" && s.type === "project")),
                )}
              />
            </div>
          )}

          {isWriteStoriesOpen && (
            <div
              className={cn(
                "border-l",
                theme === "dark" ? "border-[#334155]" : "border-gray-200",
              )}
            >
              <WriteStoriesPanel
                onClose={() => setIsWriteStoriesOpen(false)}
                onSelect={handleNewStory}
                theme={theme}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
