"use server";

import { createInquiry } from "@/data/inquiries";

export type InquiryFormState = { message?: string; ok?: boolean };

export async function sendInquiryAction(
  _prev: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!subject) return { message: "El asunto es obligatorio.", ok: false };
  if (!message) return { message: "Escribe tu mensaje.", ok: false };
  if (message.length > 4000) {
    return { message: "El mensaje es demasiado largo.", ok: false };
  }

  try {
    await createInquiry({ subject, message });
  } catch {
    return { message: "No se pudo enviar la consulta.", ok: false };
  }

  return {
    message: "Consulta enviada. Te responderemos a tu correo.",
    ok: true,
  };
}
