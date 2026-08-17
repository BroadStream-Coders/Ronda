import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, ClipboardList, Gamepad2 } from "lucide-react";

import { createClient } from "@/data/supabase/server";
import { getProgramBySlug } from "@/data/programs";
import { getProgramCollectors } from "@/collector/catalog/assignments";
import { registry } from "@/collector/catalog/registry";

export default async function DashboardPage({
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

  const total = getProgramCollectors(program.id).filter(
    (id) => registry[id],
  ).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-8">
      <header className="mb-10">
        <h1 className="font-heading text-3xl font-semibold tracking-tight">
          {program.name}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Todo lo que tu programa necesita para salir al aire, en un solo lugar.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href={`/programs/${slug}/collectors`}
          className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary"
        >
          <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardList className="size-5" />
          </span>
          <h2 className="font-heading text-xl font-semibold group-hover:text-primary">
            Colectores
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Prepara los datos de cada juego antes del aire: preguntas, palabras
            y fotos.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            {total === 1 ? "1 juego asignado" : `${total} juegos asignados`}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>

        <div className="flex flex-col rounded-xl border border-dashed border-border bg-card/40 p-6">
          <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-muted text-muted-foreground">
            <Gamepad2 className="size-5" />
          </span>
          <h2 className="font-heading flex items-center gap-2 text-xl font-semibold text-muted-foreground">
            Juegos
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal">
              Pronto
            </span>
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Emite los juegos en pantalla durante la transmisión, con lo que tu
            equipo cargó en el colector.
          </p>
        </div>
      </div>
    </div>
  );
}
