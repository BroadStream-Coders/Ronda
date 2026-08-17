import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowUpRight, ClipboardList } from "lucide-react";

import { createClient } from "@/data/supabase/server";
import { getProgramBySlug } from "@/data/programs";
import { getProgramCollectors } from "@/collector/catalog/assignments";
import { registry } from "@/collector/catalog/registry";

export default async function CollectorsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  const collectors = getProgramCollectors(program.id)
    .filter((id) => registry[id])
    .map((id) => ({ id, meta: registry[id].meta }));

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Colectores
          </h1>
          <p className="mt-2 text-muted-foreground">
            Elige un juego y carga su contenido antes del aire.
          </p>
        </div>
        {collectors.length > 0 && (
          <span className="rounded-full bg-card px-3 py-1.5 text-sm text-muted-foreground ring-1 ring-border">
            {collectors.length === 1
              ? "1 juego asignado"
              : `${collectors.length} juegos asignados`}
          </span>
        )}
      </header>

      {collectors.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-card/40 px-6 py-16 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <ClipboardList className="size-5" />
          </span>
          <p className="font-medium">Este programa aún no tiene colectores</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Cuando se asigne un juego a este programa, aparecerá acá listo para
            cargar.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {collectors.map(({ id, meta }) => {
            const Icon = meta.icon;
            return (
              <Link
                key={id}
                href={`/programs/${slug}/collectors/${id}`}
                className="group flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary"
              >
                <div className="mb-4 flex items-start justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <h2 className="font-heading text-lg font-semibold group-hover:text-primary">
                  {meta.name}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {meta.description ?? "Colector de datos."}
                </p>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
