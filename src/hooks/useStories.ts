import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Story, StoryType } from "../types/story";
import { supabase } from "../utils/supabaseClient";

const useStories = (storyType: StoryType | null) => {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    if (storyType === null) return;
    const loadStories = async () => {
      try {
        const { data: stories, error } = await supabase
          .from("stories")
          .select("*")
          .or(`type.eq.${storyType}`);

        if (error) throw error;

        setStories(stories);
      } catch (error) {
        console.error("Error loading stories:", error);
        toast.error("Failed to load stories");
      }
    };

    loadStories();
  }, []);

  return { stories, setStories };
};

export default useStories;
