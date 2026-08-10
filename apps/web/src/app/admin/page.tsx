import { Boxes } from "lucide-react";

import { AdminPlaceholder } from "@/components/admin-placeholder";

export default function AdminProgramsPage() {
  return (
    <AdminPlaceholder
      icon={Boxes}
      title="Programas"
      heading="Aquí crearás y gestionarás los programas"
      description="Próximamente: crear un programa, editar sus datos y administrar sus miembros."
    />
  );
}
