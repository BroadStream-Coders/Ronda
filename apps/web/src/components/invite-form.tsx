"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { InviteFormState } from "@/app/admin/invitations/actions";
import type { Program } from "@/data/programs";

export function InviteForm({
  action,
  programs,
}: {
  action: (
    prev: InviteFormState,
    formData: FormData,
  ) => Promise<InviteFormState>;
  programs: Program[];
}) {
  const [state, formAction, pending] = useActionState<InviteFormState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="persona@correo.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="programId">Programa</Label>
        <select
          id="programId"
          name="programId"
          defaultValue=""
          required
          className="h-9 w-full rounded-lg border border-border bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <option value="" disabled>
            Elige un programa…
          </option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name}
            </option>
          ))}
        </select>
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

      <Button type="submit" disabled={pending}>
        {pending ? "Procesando…" : "Invitar"}
      </Button>
    </form>
  );
}
