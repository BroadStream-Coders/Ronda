"use server";

import { revalidatePath } from "next/cache";

import { deleteInquiry, markInquiriesRead } from "@/data/inquiries";

export async function markInquiriesReadAction(): Promise<void> {
  await markInquiriesRead();
  revalidatePath("/admin/inquiries");
}

export async function deleteInquiryAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) await deleteInquiry(id);

  revalidatePath("/admin/inquiries");
}
