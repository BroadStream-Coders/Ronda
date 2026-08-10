"use client";

import { Button } from "@/components/ui/button";
import { deleteProgramAction } from "@/app/admin/actions";

export function DeleteProgramButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteProgramAction}
      onSubmit={(e) => {
        if (
          !confirm(
            `¿Eliminar el programa "${name}"? Esta acción no se puede deshacer.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="destructive" size="sm">
        Eliminar
      </Button>
    </form>
  );
}
