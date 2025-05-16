import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { getAuthenticatedUser } from "../utils/auth";
import { Story, mapStoryFromSupabase } from "../types/story";
import { toast } from "react-hot-toast";

// --- Query Keys ---
export const todoQueryKeys = {
  all: ["todos"] as const,
  userActive: (userId: string) =>
    ["stories", { userId, type: "todo", status: "active" }] as const,
};

// --- Custom Hooks for Data Fetching ---
export const useFetchTodos = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getAuthenticatedUser();
      setUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  return useQuery<Story[], Error>({
    queryKey: userId ? todoQueryKeys.userActive(userId) : todoQueryKeys.all,
    queryFn: async () => {
      if (!userId) throw new Error("User ID not available for fetching todos.");
      const { data: storiesData, error } = await supabase
        .from("stories")
        .select("*")
        .eq("type", "todo")
        .eq("status", "active")
        .or(`assignee.eq.${userId},created_by.eq.${userId}`);

      if (error) throw error;
      return (storiesData || []).map(mapStoryFromSupabase);
    },
    enabled: !!userId,
  });
};

// --- Custom Hooks for Mutations ---
export interface UpdateStoryStatusPayload {
  storyId: string;
  status: string;
}
export const useUpdateStoryStatus = () => {
  const queryClient = useQueryClient();
  return useMutation<Story, Error, UpdateStoryStatusPayload>({
    mutationFn: async ({ storyId, status }) => {
      const { data: storyData, error } = await supabase
        .from("stories")
        .update({ status })
        .eq("id", storyId)
        .select()
        .single();
      if (error) throw error;
      if (!storyData)
        throw new Error("Failed to update story status, no data returned.");
      return mapStoryFromSupabase(storyData);
    },
    onSuccess: async (data) => {
      toast.success(`Todo '${data.title}' marked as ${data.status}.`);
      const user = await getAuthenticatedUser();
      queryClient.invalidateQueries({
        queryKey: user ? todoQueryKeys.userActive(user.id) : todoQueryKeys.all,
      });
    },
    onError: (error) => {
      toast.error(`Failed to update todo: ${error.message}`);
    },
  });
};

export const useDeleteStory = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (storyId) => {
      const { error } = await supabase
        .from("stories")
        .delete()
        .eq("id", storyId);
      if (error) throw error;
    },
    onSuccess: async (_, storyId) => {
      toast.success("Todo deleted successfully.");
      const user = await getAuthenticatedUser();
      queryClient.invalidateQueries({
        queryKey: user ? todoQueryKeys.userActive(user.id) : todoQueryKeys.all,
      });
    },
    onError: (error) => {
      toast.error(`Failed to delete todo: ${error.message}`);
    },
  });
};
