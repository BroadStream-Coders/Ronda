import { ConfirmDialog } from "@/components/confirm-dialog";
import { deleteProgramAction } from "@/app/admin/actions";

export function DeleteProgramButton({ id, name }: { id: string; name: string }) {
  return (
    <ConfirmDialog
      action={deleteProgramAction}
      triggerLabel="Eliminar"
      title="Eliminar programa"
      description={`¿Eliminar el programa "${name}"? Esta acción no se puede deshacer.`}
      confirmLabel="Eliminar programa"
    >
      <input type="hidden" name="id" value={id} />
    </ConfirmDialog>
  );
}
