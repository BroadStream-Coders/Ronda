import { createClient } from "./supabase/server";

export type Inquiry = {
  id: string;
  user_id: string | null;
  email: string;
  name: string | null;
  subject: string;
  message: string;
  created_at: string;
  read_at: string | null;
};

const COLUMNS =
  "id, user_id, email, name, subject, message, created_at, read_at";

export async function listInquiries(): Promise<Inquiry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select(COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function countUnreadInquiries(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  if (error) throw error;
  return count ?? 0;
}

export async function createInquiry(input: {
  subject: string;
  message: string;
}): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("not authenticated");

  const name = (user.user_metadata.full_name ?? user.user_metadata.name) as
    | string
    | undefined;

  const { error } = await supabase.from("inquiries").insert({
    user_id: user.id,
    email: user.email,
    name: name ?? null,
    subject: input.subject.trim(),
    message: input.message.trim(),
  });

  if (error) throw error;
}

export async function markInquiriesRead(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("inquiries")
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null);

  if (error) throw error;
}

export async function deleteInquiry(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("inquiries").delete().eq("id", id);

  if (error) throw error;
}
