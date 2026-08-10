"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { InquiryFormState } from "@/app/actions";

export function InquiryForm({
  action,
  email,
}: {
  action: (
    prev: InquiryFormState,
    formData: FormData,
  ) => Promise<InquiryFormState>;
  email: string;
}) {
  const [state, formAction, pending] = useActionState<
    InquiryFormState,
    FormData
  >(action, {});

  if (state.ok) {
    return (
      <p className="text-sm text-primary">
        {state.message} Escribimos a <span className="font-medium">{email}</span>
        .
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="subject">Asunto</Label>
        <Input
          id="subject"
          name="subject"
          required
          maxLength={200}
          placeholder="Quiero un espacio para mi programa"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Mensaje</Label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          maxLength={4000}
          placeholder="Cuéntanos de tu programa: canal, horario y qué juegos tienes en mente."
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>

      {state.message && (
        <p
          className={cn(
            "text-sm",
            state.ok ? "text-primary" : "text-destructive",
          )}
        >
          {state.message}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Enviando…" : "Enviar consulta"}
        </Button>
        <span className="text-sm text-muted-foreground">
          Responderemos a {email}
        </span>
      </div>
    </form>
  );
}
