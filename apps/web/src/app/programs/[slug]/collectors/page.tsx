import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

  const collectors = getProgramCollectors(slug)
    .filter((id) => registry[id])
    .map((id) => ({ id, meta: registry[id].meta }));

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <Link
          href={`/programs/${slug}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> {program.name}
        </Link>

        <h1 className="mt-6 font-heading text-3xl font-semibold tracking-tight">
          Juegos
        </h1>
        <p className="text-sm text-muted-foreground">
          Colectores de este programa.
        </p>

        {collectors.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed p-10 text-center">
            <p className="text-sm text-muted-foreground">
              Este programa aún no tiene colectores asignados.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collectors.map(({ id, meta }) => {
              const Icon = meta.icon;
              return (
                <Link
                  key={id}
                  href={`/programs/${slug}/collectors/${id}`}
                  className="group"
                >
                  <Card className="h-full transition-colors group-hover:border-primary">
                    <CardHeader>
                      <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <CardTitle>{meta.name}</CardTitle>
                      <CardDescription>Colector de datos.</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
