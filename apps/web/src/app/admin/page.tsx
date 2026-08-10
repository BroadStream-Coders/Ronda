import Link from "next/link";

import { DeleteProgramButton } from "@/components/delete-program-button";
import { ProgramForm } from "@/components/program-form";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listPrograms } from "@/data/programs";
import { createProgramAction } from "./actions";

export default async function AdminProgramsPage() {
  const programs = await listPrograms();

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12">
      <h1 className="font-heading text-3xl font-semibold tracking-tight">
        Programas
      </h1>
      <p className="mt-2 text-muted-foreground">
        Crea, edita y elimina los programas de la plataforma.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_300px]">
        <div className="order-2 space-y-3 md:order-1">
          {programs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aún no hay programas. Crea el primero con el formulario.
            </p>
          ) : (
            programs.map((program) => (
              <Card key={program.id}>
                <CardContent className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <div className="font-medium">{program.name}</div>
                    <div className="text-sm text-muted-foreground">
                      /{program.slug}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/programs/${program.id}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                      })}
                    >
                      Editar
                    </Link>
                    <DeleteProgramButton id={program.id} name={program.name} />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="order-1 md:order-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nuevo programa</CardTitle>
            </CardHeader>
            <CardContent>
              <ProgramForm action={createProgramAction} submitLabel="Crear" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
