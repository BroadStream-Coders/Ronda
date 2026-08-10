import { createClient } from "./supabase/server";

export type Programa = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

const COLUMNS = "id, name, slug, created_at";

export async function listProgramas(): Promise<Programa[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programas")
    .select(COLUMNS)
    .order("name");

  if (error) throw error;
  return data ?? [];
}

export async function getProgramaBySlug(slug: string): Promise<Programa | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programas")
    .select(COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data;
}
