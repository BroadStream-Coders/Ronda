import { InviteForm } from "@/components/invite-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Invitaciones
      </h1>
      <p className="mt-2 text-muted-foreground">
        Da acceso a un programa por email. Si la persona aún no se registró,
        queda pendiente y se activa en su primer inicio de sesión.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_300px]">
        <div className="order-2 space-y-3 md:order-1">
          {invitations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay invitaciones.
            </p>
          ) : (
            invitations.map((invitation) => (
              <Card key={invitation.id}>
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <div className="font-medium">{invitation.email}</div>
                    <div className="text-sm text-muted-foreground">
                      {programName.get(invitation.program_id) ?? "—"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {invitation.claimed_at ? (
                      <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                        Tomada · {formatDate(invitation.claimed_at)}
                      </span>
                    ) : (
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        Pendiente
                      </span>
                    )}
                    <form action={deleteInvitationAction}>
                      <input type="hidden" name="id" value={invitation.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        Eliminar
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="order-1 md:order-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nueva invitación</CardTitle>
            </CardHeader>
            <CardContent>
              <InviteForm action={inviteAction} programs={programs} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
