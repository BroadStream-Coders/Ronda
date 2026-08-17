import { AdminEmpty, AdminPage } from "@/components/admin-page";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { listInquiries } from "@/data/inquiries";
import { deleteInquiryAction, markInquiriesReadAction } from "./actions";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminInquiriesPage() {
  const inquiries = await listInquiries();
  const unread = inquiries.filter((i) => !i.read_at).length;

  return (
    <AdminPage
      title="Mensajes"
      description="Consultas enviadas desde el home por usuarios sin programa asignado."
      action={
        unread > 0 ? (
          <form action={markInquiriesReadAction}>
            <Button type="submit" variant="outline" className="h-9 px-3">
              Marcar como leídas ({unread})
            </Button>
          </form>
        ) : undefined
      }
    >
      {inquiries.length === 0 ? (
        <AdminEmpty>Aún no hay mensajes.</AdminEmpty>
      ) : (
        <div className="flex flex-col gap-3">
          {inquiries.map((inquiry) => (
            <div
              key={inquiry.id}
              className={`flex flex-col gap-3 rounded-xl border bg-card p-4 ${
                inquiry.read_at ? "border-border" : "border-primary/40"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">
                      {inquiry.name ?? inquiry.email}
                    </span>
                    {!inquiry.read_at && (
                      <span className="shrink-0 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
                        Nuevo
                      </span>
                    )}
                  </div>
                  <div className="truncate text-sm text-muted-foreground">
                    {inquiry.email} · {formatDate(inquiry.created_at)}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    nativeButton={false}
                    render={
                      <a
                        href={`mailto:${inquiry.email}?subject=${encodeURIComponent(
                          `Re: ${inquiry.subject}`,
                        )}`}
                      />
                    }
                  >
                    Responder
                  </Button>
                  <ConfirmDialog
                    action={deleteInquiryAction}
                    triggerLabel="Eliminar"
                    title="Eliminar mensaje"
                    description={`¿Eliminar la consulta de "${inquiry.email}"? No se puede deshacer.`}
                    confirmLabel="Eliminar mensaje"
                  >
                    <input type="hidden" name="id" value={inquiry.id} />
                  </ConfirmDialog>
                </div>
              </div>

              <div>
                <div className="font-medium">{inquiry.subject}</div>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                  {inquiry.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPage>
  );
}
