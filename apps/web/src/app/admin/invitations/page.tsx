import { AdminEmpty, AdminPage } from "@/components/admin-page";
import { InviteForm } from "@/components/invite-form";
import { Button } from "@/components/ui/button";
import { listInvitations } from "@/data/invitations";
import { listPrograms } from "@/data/programs";
import { deleteInvitationAction, inviteAction } from "./actions";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminInvitationsPage() {
  const [invitations, programs] = await Promise.all([
    listInvitations(),
    listPrograms(),
  ]);
  const programName = new Map(programs.map((p) => [p.id, p.name]));

  return (
    <AdminPage
      title="Invitaciones"
      description="Da acceso a un programa por email. Si la persona aún no se registró, queda pendiente y se activa en su primer inicio de sesión."
    >
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="order-2 flex flex-col gap-2 md:order-1">
          {invitations.length === 0 ? (
            <AdminEmpty>Aún no hay invitaciones.</AdminEmpty>
          ) : (
            invitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{invitation.email}</div>
                  <div className="truncate text-sm text-muted-foreground">
                    {programName.get(invitation.program_id) ?? "—"}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {invitation.claimed_at ? (
                    <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                      Tomada · {formatDate(invitation.claimed_at)}
                    </span>
                  ) : (
                    <span className="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
                      Pendiente
                    </span>
                  )}
                  <form action={deleteInvitationAction}>
                    <input type="hidden" name="id" value={invitation.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      Eliminar
                    </Button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="order-1 md:order-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-heading mb-4 text-lg font-semibold">
              Nueva invitación
            </h2>
            <InviteForm action={inviteAction} programs={programs} />
          </div>
        </div>
      </div>
    </AdminPage>
  );
}
