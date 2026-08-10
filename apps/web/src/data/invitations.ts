import { createClient } from "./supabase/server";

export type Invitation = {
  id: string;
  email: string;
  program_id: string;
  created_at: string;
  claimed_at: string | null;
};

export type InviteResult =
  | "granted"
  | "already_member"
  | "pending"
  | "already_pending";

export async function listInvitations(): Promise<Invitation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invitations")
    .select("id, email, program_id, created_at, claimed_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function inviteToProgram(
  email: string,
  programId: string,
): Promise<InviteResult> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("invite_to_program", {
    target_email: email,
    target_program: programId,
  });

  if (error) throw error;
  return data as InviteResult;
}

export async function deleteInvitation(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("invitations").delete().eq("id", id);

  if (error) throw error;
}

export async function claimPendingInvitations(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("claim_pending_invitations");

  if (error) throw error;
}
