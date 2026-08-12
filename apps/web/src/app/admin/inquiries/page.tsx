import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Mensajes
          </h1>
          <p className="mt-2 text-muted-foreground">
            Consultas enviadas desde el home por usuarios sin programa asignado.
          </p>
        </div>

        {unread > 0 && (
          <form action={markInquiriesReadAction}>
            <Button type="submit" variant="outline" size="sm">
              Marcar como leídas ({unread})
            </Button>
          </form>
        )}
      </div>

      <div className="mt-8 space-y-3">
        {inquiries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aún no hay mensajes.</p>
        ) : (
          inquiries.map((inquiry) => (
            <Card
              key={inquiry.id}
              className={inquiry.read_at ? undefined : "border-primary/40"}
            >
              <CardContent className="space-y-3 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {inquiry.name ?? inquiry.email}
                      </span>
                      {!inquiry.read_at && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {inquiry.email} · {formatDate(inquiry.created_at)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
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
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {inquiry.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
