import { createClient } from "./supabase/server";

export type Program = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

const COLUMNS = "id, name, slug, created_at";

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[^\x00-\x7F]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

export async function getProgramById(id: string): Promise<Program | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("programs")
    .select(COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function createProgram(input: {
  name: string;
  slug?: string;
}): Promise<void> {
  const supabase = await createClient();
  const slug = slugify(input.slug?.trim() ? input.slug : input.name);
  const { error } = await supabase
    .from("programs")
    .insert({ name: input.name.trim(), slug });

  if (error) throw error;
}

export async function updateProgram(
  id: string,
  input: { name: string; slug?: string },
): Promise<void> {
  const supabase = await createClient();
  const slug = slugify(input.slug?.trim() ? input.slug : input.name);
  const { error } = await supabase
    .from("programs")
    .update({ name: input.name.trim(), slug })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteProgram(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("programs").delete().eq("id", id);

  if (error) throw error;
}
