import { createClient } from "./supabase/server";

export type Membership = {
  user_id: string;
  program_id: string;
};

export async function listMemberships(): Promise<Membership[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("user_id, program_id");

  if (error) throw error;
  return data ?? [];
}

export async function addMembership(
  userId: string,
  programId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("memberships")
    .insert({ user_id: userId, program_id: programId });

  if (error) throw error;
}

export async function removeMembership(
  userId: string,
  programId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("memberships")
    .delete()
    .eq("user_id", userId)
    .eq("program_id", programId);

  if (error) throw error;
}
