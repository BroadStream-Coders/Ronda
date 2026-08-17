import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeftRight } from "lucide-react";

import { AccountMenu } from "@/components/account-menu";
import { AdminNav } from "@/components/admin-nav";
import { RondaMark } from "@/components/ronda-logo";
import { createClient } from "@/data/supabase/server";
import { isPlatformAdmin } from "@/data/admin";
import { countUnreadInquiries } from "@/data/inquiries";

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

  const unread = await countUnreadInquiries();

  const name = (user.user_metadata.full_name ?? user.user_metadata.name) as
    | string
    | undefined;
  const avatar = (user.user_metadata.avatar_url ??
    user.user_metadata.picture) as string | undefined;

  return (
    <div className="flex h-dvh overflow-hidden">
      <aside className="flex w-60 shrink-0 flex-col border-r border-border bg-card max-md:hidden">
        <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-border px-3">
          <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
            <RondaMark className="size-7" />
            <span className="min-w-0 flex-1">
              <span className="font-heading block truncate text-sm font-semibold">
                Ronda
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                Panel de plataforma
              </span>
            </span>
          </Link>
        </div>

        <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2">
          <AdminNav unread={unread} />
        </nav>

        <div className="shrink-0 border-t border-border p-2">
          <AccountMenu
            user={{
              name: name ?? null,
              email: user.email ?? null,
              avatar: avatar ?? null,
            }}
            secondary={{
              href: "/programs",
              label: "Ver como usuario",
              icon: <ArrowLeftRight />,
            }}
          />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4 md:hidden">
          <RondaMark className="size-6" />
          <span className="font-heading text-sm font-semibold">Admin</span>
          <nav className="ml-auto flex items-center gap-1">
            <AdminNav unread={unread} compact />
          </nav>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}
