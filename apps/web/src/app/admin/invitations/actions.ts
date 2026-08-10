"use server";

import { revalidatePath } from "next/cache";

import {
  deleteInvitation,
  inviteToProgram,
  type InviteResult,
} from "@/data/invitations";

export type InviteFormState = { message?: string; ok?: boolean };

const messages: Record<InviteResult, string> = {
  granted: "Acceso otorgado: el email ya estaba registrado.",
  already_member: "Ese usuario ya tiene acceso a este programa.",
  pending: "Invitación creada. Se activará en su primer inicio de sesión.",
  already_pending: "Ya hay una invitación pendiente para ese email y programa.",
};

export async function inviteAction(
  _prev: InviteFormState,
  formData: FormData,
): Promise<InviteFormState> {
  const email = String(formData.get("email") ?? "").trim();
  const programId = String(formData.get("programId") ?? "");
  if (!email) return { message: "El email es obligatorio.", ok: false };
  if (!programId) return { message: "Elige un programa.", ok: false };

  let result: InviteResult;
  try {
    result = await inviteToProgram(email, programId);
  } catch {
    return { message: "No se pudo procesar la invitación.", ok: false };
  }

  revalidatePath("/admin/invitations");
  return {
    message: messages[result],
    ok: result === "granted" || result === "pending",
  };
}

export async function deleteInvitationAction(
  formData: FormData,
): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) await deleteInvitation(id);

  revalidatePath("/admin/invitations");
}
