"use server";

import { revalidatePath } from "next/cache";

import { addMembership, removeMembership } from "@/data/memberships";
import { deleteUser } from "@/data/users";

export async function addMembershipAction(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") ?? "");
  const programId = String(formData.get("programId") ?? "");
  if (userId && programId) await addMembership(userId, programId);

  revalidatePath("/admin/users");
}

export async function removeMembershipAction(
  formData: FormData,
): Promise<void> {
  const userId = String(formData.get("userId") ?? "");
  const programId = String(formData.get("programId") ?? "");
  if (userId && programId) await removeMembership(userId, programId);

  revalidatePath("/admin/users");
}

export async function deleteUserAction(formData: FormData): Promise<void> {
  const userId = String(formData.get("userId") ?? "");
  if (userId) await deleteUser(userId);

  revalidatePath("/admin/users");
}
