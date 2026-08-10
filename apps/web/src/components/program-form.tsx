"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProgramFormState } from "@/app/admin/actions";
import type { Program } from "@/data/programs";

export function ProgramForm({
  action,
  program,
  submitLabel,
}: {
  action: (
    prev: ProgramFormState,
    formData: FormData,
  ) => Promise<ProgramFormState>;
  program?: Program;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<
    ProgramFormState,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {program && <input type="hidden" name="id" value={program.id} />}

      <div className="space-y-1.5">
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" defaultValue={program?.name} required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={program?.slug}
          placeholder="se genera del nombre"
        />
      </div>

      {state.error && <p className="text-sm text-destructive">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando…" : submitLabel}
      </Button>
    </form>
  );
}
