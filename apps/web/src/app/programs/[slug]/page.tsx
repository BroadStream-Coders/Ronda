import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Gamepad2, Radio } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/data/supabase/server";
import { getProgramBySlug } from "@/data/programs";

const secciones = [
  {
    icon: Gamepad2,
    title: "Juegos",
    description: "Crea y prepara los juegos de este programa antes del aire.",
  },
  {
    icon: Radio,
    title: "Sesiones en vivo",
    description: "Emite los juegos en pantalla durante la transmisión.",
  },
];

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

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <Link
          href="/programs"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Todos los programas
        </Link>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-xl bg-primary/10 font-heading text-2xl font-semibold text-primary">
            {program.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              {program.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              Espacio de trabajo del programa
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {secciones.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="border-dashed">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  {title}
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                    Pronto
                  </span>
                </CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
