import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ProgramForm } from "@/components/program-form";
import { getProgramById } from "@/data/programs";
import { updateProgramAction } from "../../actions";

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const program = await getProgramById(id);
  if (!program) notFound();

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-10 sm:px-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Programas
      </Link>

      <h1 className="font-heading mt-6 text-3xl font-semibold tracking-tight">
        Editar programa
      </h1>
      <p className="mt-2 text-muted-foreground">
        Cambia el nombre o el slug de{" "}
        <span className="text-foreground">{program.name}</span>.
      </p>

      <div className="mt-8 rounded-xl border border-border bg-card p-5">
        <ProgramForm
          action={updateProgramAction}
          program={program}
          submitLabel="Guardar cambios"
        />
      </div>
    </div>
  );
}
