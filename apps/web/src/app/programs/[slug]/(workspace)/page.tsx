import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRight, ClipboardList, Gamepad2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { createClient } from "@/data/supabase/server";
import { getProgramBySlug } from "@/data/programs";
import {
  getProgramCollectors,
  getProgramGames,
  hasService,
} from "@/data/program-services";
import { registry } from "@/collector/catalog/registry";
import { metas as gameMetas } from "@/game/catalog/metas";

function ServiceCard({
  href,
  icon: Icon,
  title,
  description,
  count,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary"
    >
      <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <h2 className="font-heading text-xl font-semibold group-hover:text-primary">
        {title}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        {count === 1 ? "1 juego asignado" : `${count} juegos asignados`}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

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

  const collectors = hasService(program.id, "collectors")
    ? getProgramCollectors(program.id).filter((id) => registry[id]).length
    : null;
  const games = hasService(program.id, "games")
    ? getProgramGames(program.id).filter((id) => gameMetas[id]).length
    : null;

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
        {collectors !== null && (
          <ServiceCard
            href={`/programs/${slug}/collectors`}
            icon={ClipboardList}
            title="Colectores"
            description="Prepara los datos de cada juego antes del aire: preguntas, palabras y fotos."
            count={collectors}
          />
        )}

        {games !== null && (
          <ServiceCard
            href={`/programs/${slug}/games`}
            icon={Gamepad2}
            title="Juegos"
            description="Emite los juegos en pantalla durante la transmisión, con lo que tu equipo cargó en el colector."
            count={games}
          />
        )}
      </div>
    </div>
  );
}
