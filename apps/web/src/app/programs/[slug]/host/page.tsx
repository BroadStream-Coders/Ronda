import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight, Tv } from "lucide-react";

import { AccountMenu } from "@/components/account-menu";
import { createClient } from "@/data/supabase/server";
import { getProgramBySlug } from "@/data/programs";
import { getProgramHostGames } from "@/data/program-services";
import { registry } from "@/collector/catalog/registry";
import { views } from "@/host/catalog/views";

export default async function HostIndexPage({
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

  const games = getProgramHostGames(program.id)
    .filter((id) => views[id] && registry[id])
    .map((id) => ({ id, meta: registry[id].meta }));

  const name = (user.user_metadata.full_name ?? user.user_metadata.name) as
    | string
    | undefined;
  const avatar = (user.user_metadata.avatar_url ??
    user.user_metadata.picture) as string | undefined;

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
        <span className="font-heading flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-base font-semibold text-primary-foreground">
          {program.name.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-medium">
            {program.name}
          </span>
          <span className="block truncate text-sm text-muted-foreground">
            Vista del conductor
          </span>
        </span>
        <span className="size-11 shrink-0">
          <AccountMenu
            user={{
              name: name ?? null,
              email: user.email ?? null,
              avatar: avatar ?? null,
            }}
            collapsed
          />
        </span>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-4xl px-4 py-6">
          {games.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 px-6 py-20 text-center">
              <span className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Tv className="size-6" />
              </span>
              <p className="text-lg font-medium">
                Todavía no hay juegos para consultar
              </p>
              <p className="max-w-md text-base text-muted-foreground">
                Cuando se habilite un juego para esta vista, aparecerá acá con
                los datos que cargó el equipo.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {games.map(({ id, meta }) => {
                const Icon = meta.icon;
                return (
                  <li key={id}>
                    <Link
                      href={`/programs/${slug}/host/${id}`}
                      className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-colors active:border-primary"
                    >
                      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-6" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-heading block truncate text-lg font-semibold">
                          {meta.name}
                        </span>
                        {meta.description && (
                          <span className="block truncate text-base text-muted-foreground">
                            {meta.description}
                          </span>
                        )}
                      </span>
                      <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
