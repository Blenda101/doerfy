import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { toast } from "react-hot-toast";

export interface List {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface UseListsReturn {
  isLoading: boolean;
  error: string | null;
  lists: List[];
  setLists: (lists: List[]) => void;
}

export const useLists = (): UseListsReturn => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lists, setLists] = useState<List[]>([]);

  useEffect(() => {
    const loadLists = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          throw new Error("No authenticated user found");
        }

        // Load lists
        const { data: listsData, error: listsError } = await supabase
          .from("lists")
          .select("*")
          .eq("owner_id", user.id)
          .order("created_at", { ascending: false });

        if (listsError) throw listsError;
        setLists(listsData || []);
      } catch (error) {
        console.error("Error loading lists:", error);
        setError("Failed to load lists");
        toast.error("Failed to load lists");
      } finally {
        setIsLoading(false);
      }
    };

    loadLists();
  }, []);

  return {
    isLoading,
    error,
    lists,
    setLists,
  };
};
