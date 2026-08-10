import { Users } from "lucide-react";

import { AdminPlaceholder } from "@/components/admin-placeholder";

export default function AdminUsersPage() {
  return (
    <AdminPlaceholder
      icon={Users}
      title="Usuarios"
      heading="Aquí verás y gestionarás a los usuarios"
      description="Próximamente: ver las personas registradas y a qué programas tienen acceso."
    />
  );
}
