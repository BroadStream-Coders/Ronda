import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ProgramForm } from "@/components/program-form";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="mx-auto w-full max-w-xl px-6 py-12">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Programas
      </Link>

      <h1 className="font-heading mt-6 text-2xl font-semibold tracking-tight">
        Editar programa
      </h1>

      <Card className="mt-6">
        <CardContent className="py-6">
          <ProgramForm
            action={updateProgramAction}
            program={program}
            submitLabel="Guardar cambios"
          />
        </CardContent>
      </Card>
    </div>
  );
}
