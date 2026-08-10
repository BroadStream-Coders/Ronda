"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createProgram, deleteProgram, updateProgram } from "@/data/programs";

export type ProgramFormState = { error?: string };

function saveError(e: unknown): string {
  if (
    typeof e === "object" &&
    e !== null &&
    "code" in e &&
    (e as { code?: string }).code === "23505"
  ) {
    return "Ya existe un programa con ese slug. Prueba con otro nombre o slug.";
  }
  return "No se pudo guardar. Intenta de nuevo.";
}

export async function createProgramAction(
  _prev: ProgramFormState,
  formData: FormData,
): Promise<ProgramFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!name) return { error: "El nombre es obligatorio." };

  try {
    await createProgram({ name, slug });
  } catch (e) {
    return { error: saveError(e) };
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateProgramAction(
  _prev: ProgramFormState,
  formData: FormData,
): Promise<ProgramFormState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  if (!id) return { error: "Falta el identificador del programa." };
  if (!name) return { error: "El nombre es obligatorio." };

  try {
    await updateProgram(id, { name, slug });
  } catch (e) {
    return { error: saveError(e) };
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteProgramAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) await deleteProgram(id);

  revalidatePath("/admin");
  redirect("/admin");
}
