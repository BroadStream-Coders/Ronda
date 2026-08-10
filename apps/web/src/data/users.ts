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

export async function deleteUser(userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_delete_user", {
    target_user: userId,
  });

  if (error) throw error;
}
