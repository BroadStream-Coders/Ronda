import { X } from "lucide-react";

import { AdminEmpty, AdminPage } from "@/components/admin-page";
import { Button } from "@/components/ui/button";
import { DeleteUserButton } from "@/components/delete-user-button";
import { createClient } from "@/data/supabase/server";
import { listMemberships } from "@/data/memberships";
import { listPrograms } from "@/data/programs";
import { listUsers } from "@/data/users";
import { addMembershipAction, removeMembershipAction } from "./actions";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminUsersPage() {
  const [users, programs, memberships] = await Promise.all([
    listUsers(),
    listPrograms(),
    listMemberships(),
  ]);

  const supabase = await createClient();
  const {
    data: { user: me },
  } = await supabase.auth.getUser();

  return (
    <AdminPage
      title="Usuarios"
      description="Gestiona a qué programas tiene acceso cada persona registrada."
    >
      {users.length === 0 ? (
        <AdminEmpty>Aún no hay usuarios registrados.</AdminEmpty>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map((user) => {
            const assignedIds = new Set(
              memberships
                .filter((m) => m.user_id === user.id)
                .map((m) => m.program_id),
            );
            const assigned = programs.filter((p) => assignedIds.has(p.id));
            const available = programs.filter((p) => !assignedIds.has(p.id));

            return (
              <div
                key={user.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {user.email ?? "(sin email)"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Registrado el {formatDate(user.created_at)}
                    </div>
                  </div>
                  {user.id === me?.id ? (
                    <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                      Tú
                    </span>
                  ) : (
                    <DeleteUserButton
                      userId={user.id}
                      email={user.email ?? user.id}
                    />
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {assigned.length === 0 ? (
                    <span className="text-sm text-muted-foreground">
                      Sin programas asignados
                    </span>
                  ) : (
                    assigned.map((program) => (
                      <form
                        key={program.id}
                        action={removeMembershipAction}
                        className="inline-flex"
                      >
                        <input type="hidden" name="userId" value={user.id} />
                        <input
                          type="hidden"
                          name="programId"
                          value={program.id}
                        />
                        <button
                          type="submit"
                          title={`Quitar acceso a ${program.name}`}
                          className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          {program.name} <X className="size-3.5" />
                        </button>
                      </form>
                    ))
                  )}
                </div>

                {available.length > 0 && (
                  <form
                    action={addMembershipAction}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="userId" value={user.id} />
                    <select
                      name="programId"
                      defaultValue=""
                      required
                      aria-label="Programa a agregar"
                      className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="" disabled>
                        Agregar programa…
                      </option>
                      {available.map((program) => (
                        <option key={program.id} value={program.id}>
                          {program.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="submit"
                      variant="outline"
                      className="h-9 px-3"
                    >
                      Agregar
                    </Button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminPage>
  );
}
