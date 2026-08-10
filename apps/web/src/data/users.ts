import { createClient } from "./supabase/server";

export type AppUser = {
  id: string;
  email: string | null;
  created_at: string;
};

export async function listUsers(): Promise<AppUser[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_list_users");

  if (error) throw error;
  return data ?? [];
}
