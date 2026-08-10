import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Boxes } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/data/supabase/server";
import { listPrograms } from "@/data/programs";

export default async function ProgramsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const programs = await listPrograms();
  if (programs.length === 0) redirect("/");

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="relative flex-1 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-40 h-[400px] bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-primary)_0%,transparent_70%)] opacity-15"
        />
        <section className="mx-auto w-full max-w-5xl px-6 py-16">
          <div className="mb-10">
            <Badge variant="secondary">
              <Boxes className="text-primary" /> Tus espacios
            </Badge>
            <h1 className="font-heading mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              Elige un programa
            </h1>
            <p className="mt-2 text-muted-foreground">
              Cada programa es un espacio de trabajo aislado, con sus propios
              juegos y datos.
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((program) => (
              <li key={program.id}>
                <Link
                  href={`/programs/${program.slug}`}
                  className="group block h-full"
                >
                  <Card className="h-full transition-all hover:border-primary hover:shadow-sm">
                    <CardHeader>
                      <div className="mb-3 flex size-11 items-center justify-center rounded-lg bg-primary/10 font-heading text-lg font-semibold text-primary">
                        {program.name.charAt(0)}
                      </div>
                      <CardTitle className="flex items-center justify-between gap-2 group-hover:text-primary">
                        {program.name}
                        <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                      </CardTitle>
                      <CardDescription>
                        Entrar al espacio de trabajo
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
