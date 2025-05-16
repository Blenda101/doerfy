import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { getAuthenticatedUser } from "../utils/auth";
import { TimeBox } from "../types/timeBox";
import { defaultTimeBoxes } from "../data/timeBoxes";
import { TimeBoxConfig } from "../components/TimeBoxDialog";
import { toast } from "react-hot-toast";

// --- Query Keys ---
export const timeBoxQueryKeys = {
  all: ["time_boxes"] as const,
  user: (userId: string) => [...timeBoxQueryKeys.all, userId] as const,
};

// --- Custom Hooks for Data Fetching ---
export const useFetchTimeBoxes = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getAuthenticatedUser();
      console.log("Fetched user:", user);
      setUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  console.log("useFetchTimeBoxes - userId:", userId);

  return useQuery<TimeBox[], Error>({
    queryKey: userId ? timeBoxQueryKeys.user(userId) : timeBoxQueryKeys.all,
    queryFn: async () => {
      console.log("Fetching time boxes...");
      if (!userId) {
        console.log("No user ID, returning default time boxes");
        return defaultTimeBoxes;
      }

      const { data: timeBoxData, error: timeBoxError } = await supabase
        .from("time_boxes")
        .select("*")
        .order("sort_order");

      if (timeBoxError) {
        console.error("Error fetching time boxes:", timeBoxError);
        throw timeBoxError;
      }

      if (!timeBoxData || timeBoxData.length === 0) {
        console.log("No time boxes found, inserting defaults...");
        const { data: inserted, error: insertError } = await supabase
          .from("time_boxes")
          .insert(defaultTimeBoxes)
          .select();
        if (insertError) {
          console.error("Failed to insert default time boxes:", insertError);
          throw insertError;
        }
        return inserted || defaultTimeBoxes;
      }

      console.log("Fetched time boxes:", timeBoxData);
      return timeBoxData;
    },
    enabled: true,
    placeholderData: (previousData) => previousData,
    staleTime: 30000,
  });
};

// --- Custom Hooks for Mutations ---
export interface UpdateTimeBoxConfigPayload {
  id: string;
  config: Partial<TimeBoxConfig>;
}
export const useUpdateTimeBoxConfig = () => {
  const queryClient = useQueryClient();
  return useMutation<TimeBox, Error, UpdateTimeBoxConfigPayload>({
    mutationFn: async ({ id, config }) => {
      const { data, error } = await supabase
        .from("time_boxes")
        .update(config as any) // Using 'as any' for config due to potential partial nature / DB schema mismatch
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      if (!data)
        throw new Error(
          "Failed to update timebox configuration, no data returned.",
        );
      return data;
    },
    onSuccess: async (data) => {
      toast.success(`TimeBox '${data.name}' updated.`);
      const user = await getAuthenticatedUser();
      queryClient.invalidateQueries({
        queryKey: user ? timeBoxQueryKeys.user(user.id) : timeBoxQueryKeys.all,
      });
    },
    onError: (error) => {
      toast.error(`Failed to update timebox: ${error.message}`);
    },
  });
};

export const useUpdateTimeBoxOrder = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, TimeBox[]>({
    mutationFn: async (updatedTimeBoxesFullArray) => {
      const updates = updatedTimeBoxesFullArray.map((tb) =>
        supabase
          .from("time_boxes")
          .update({ sort_order: tb.sort_order })
          .eq("id", tb.id),
      );
      const results = await Promise.all(updates);
      results.forEach((result) => {
        if (result.error) throw result.error;
      });
    },
    onSuccess: async () => {
      toast.success("TimeBox order updated.");
      const user = await getAuthenticatedUser();
      queryClient.invalidateQueries({
        queryKey: user ? timeBoxQueryKeys.user(user.id) : timeBoxQueryKeys.all,
      });
    },
    onError: (error) => {
      toast.error(`Failed to reorder timeboxes: ${error.message}`);
    },
  });
};
