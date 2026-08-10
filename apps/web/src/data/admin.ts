import { createClient } from "./supabase/server";

export async function isPlatformAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("is_platform_admin");

  if (error) throw error;
  return data ?? false;
}
