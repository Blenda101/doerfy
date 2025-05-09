import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Story } from "../types/story";
import { supabase } from "../utils/supabaseClient";

const useStories = () => {
  const [stories, setStories] = useState<Story[]>([]);

  useEffect(() => {
    const loadStories = async () => {
      try {
        const { data: stories, error } = await supabase
          .from("stories")
          .select("*")
          .or(`type.eq.todo`);

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
