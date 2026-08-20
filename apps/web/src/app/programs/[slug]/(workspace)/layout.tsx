import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { ProgramSidebar } from "@/components/program-sidebar";
import { createClient } from "@/data/supabase/server";
import { getProgramBySlug } from "@/data/programs";
import { getProgramCollectors } from "@/collector/catalog/assignments";
import { registry } from "@/collector/catalog/registry";
import { getProgramGames } from "@/game/catalog/assignments";
import { registry as gameRegistry } from "@/game/catalog/registry";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode;
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

  const collectors = getProgramCollectors(program.id)
    .filter((id) => registry[id])
    .map((id) => {
      const { meta } = registry[id];
      const Icon = meta.icon;
      return { id, name: meta.name, icon: <Icon /> };
    });

  const hasGames = getProgramGames(program.id).some((id) => gameRegistry[id]);

  const name = (user.user_metadata.full_name ?? user.user_metadata.name) as
    | string
    | undefined;
  const avatar = (user.user_metadata.avatar_url ??
    user.user_metadata.picture) as string | undefined;

  const collapsed = (await cookies()).get("ronda_sidebar")?.value === "1";

  return (
    <div className="flex h-dvh overflow-hidden">
      <ProgramSidebar
        slug={slug}
        programName={program.name}
        user={{
          name: name ?? null,
          email: user.email ?? null,
          avatar: avatar ?? null,
        }}
        collectors={collectors}
        hasGames={hasGames}
        defaultCollapsed={collapsed}
      />
      <main className="min-w-0 flex-1 overflow-y-auto bg-muted/40">
        {children}
      </main>
    </div>
  );
}
