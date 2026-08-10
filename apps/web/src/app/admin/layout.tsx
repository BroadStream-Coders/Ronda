import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Radio } from "lucide-react";

import { AdminNav } from "@/components/admin-nav";
import { AuthButton } from "@/components/auth-button";
import { createClient } from "@/data/supabase/server";
import { isPlatformAdmin } from "@/data/admin";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");
  if (!(await isPlatformAdmin())) redirect("/programs");

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="flex shrink-0 flex-col gap-6 border-b bg-muted/30 p-4 md:w-60 md:border-b-0 md:border-r">
        <div className="flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-heading text-lg font-semibold tracking-tight"
          >
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Radio className="size-4" />
            </span>
            Ronda
          </Link>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Admin
          </span>
        </div>

        <AdminNav />

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <Link
            href="/programs"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            Ver como usuario
          </Link>
          <AuthButton />
        </div>
      </aside>

      <main className="flex-1">{children}</main>
    </div>
  );
}
