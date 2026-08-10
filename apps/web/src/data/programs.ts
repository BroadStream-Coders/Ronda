import { createClient } from "./supabase/server";

export type Program = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

const COLUMNS = "id, name, slug, created_at";

export async function listPrograms(): Promise<Program[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .select(COLUMNS)
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getProgramBySlug(slug: string): Promise<Program | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .select(COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}
