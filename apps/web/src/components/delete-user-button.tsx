import { ConfirmDialog } from "@/components/confirm-dialog";
import { deleteUserAction } from "@/app/admin/users/actions";

export function DeleteUserButton({
  userId,
  email,
}: {
  userId: string;
  email: string;
}) {
  return (
    <ConfirmDialog
      action={deleteUserAction}
      triggerLabel="Eliminar"
      title="Eliminar usuario"
      description={`¿Eliminar al usuario "${email}" por completo? Se borrarán todos sus accesos. No se puede deshacer.`}
      confirmLabel="Eliminar usuario"
    >
      <input type="hidden" name="userId" value={userId} />
    </ConfirmDialog>
  );
}
