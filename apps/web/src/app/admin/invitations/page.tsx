import { Mail } from "lucide-react";

import { AdminPlaceholder } from "@/components/admin-placeholder";

export default function AdminInvitationsPage() {
  return (
    <AdminPlaceholder
      icon={Mail}
      title="Invitaciones"
      heading="Aquí invitarás por email"
      description="Próximamente: dar acceso a un programa por correo antes de que la persona se registre."
    />
  );
}
