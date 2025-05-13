import { supabase } from "./supabaseClient";

export async function getAuthenticatedUser() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("No authenticated user found");
  }

  return user;
}
