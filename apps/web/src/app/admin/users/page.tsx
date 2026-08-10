import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Usuarios
      </h1>
      <p className="mt-2 text-muted-foreground">
        Gestiona a qué programas tiene acceso cada persona registrada.
      </p>

      <div className="mt-8 space-y-4">
        {users.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aún no hay usuarios registrados.
          </p>
        ) : (
          users.map((user) => {
            const assignedIds = new Set(
              memberships
                .filter((m) => m.user_id === user.id)
                .map((m) => m.program_id),
            );
            const assigned = programs.filter((p) => assignedIds.has(p.id));
            const available = programs.filter((p) => !assignedIds.has(p.id));

            return (
              <Card key={user.id}>
                <CardContent className="space-y-3 py-4">
                  <div>
                    <div className="font-medium">
                      {user.email ?? "(sin email)"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Registrado el {formatDate(user.created_at)}
                    </div>
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
                            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary transition-colors hover:bg-destructive/10 hover:text-destructive"
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
                        className="h-8 rounded-lg border border-border bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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
                      <Button type="submit" variant="outline" size="sm">
                        Agregar
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
