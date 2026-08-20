import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { AdminEmpty, AdminPage } from "@/components/admin-page";
import { DeleteProgramButton } from "@/components/delete-program-button";
import { ProgramForm } from "@/components/program-form";
import { buttonVariants } from "@/components/ui/button";
import { listPrograms } from "@/data/programs";
import { createProgramAction } from "./actions";

export default async function AdminProgramsPage() {
  const programs = await listPrograms();

  return (
    <AdminPage
      title="Programas"
      description="Crea, edita y elimina los programas de la plataforma."
    >
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="order-2 flex flex-col gap-2 md:order-1">
          {programs.length === 0 ? (
            <AdminEmpty>
              Aún no hay programas. Crea el primero con el formulario.
            </AdminEmpty>
          ) : (
            programs.map((program) => (
              <div
                key={program.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{program.name}</div>
                  <div className="truncate text-sm text-muted-foreground">
                    /{program.slug}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/programs/${program.slug}`}
                    className={buttonVariants({
                      variant: "outline",
                      size: "sm",
                    })}
                  >
                    Abrir
                    <ArrowUpRight className="size-4" />
                  </Link>
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
              </div>
            ))
          )}
        </div>

        <div className="order-1 md:order-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-heading mb-4 text-lg font-semibold">
              Nuevo programa
            </h2>
            <ProgramForm action={createProgramAction} submitLabel="Crear" />
          </div>
        </div>
      </div>
    </AdminPage>
  );
}
