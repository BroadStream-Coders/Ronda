import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";

import { ProgramSidebar } from "@/components/program-sidebar";
import { createClient } from "@/data/supabase/server";
import { getProgramBySlug } from "@/data/programs";

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

  const name = (user.user_metadata.full_name ?? user.user_metadata.name) as
    | string
    | undefined;
  const avatar = (user.user_metadata.avatar_url ??
    user.user_metadata.picture) as string | undefined;

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
      />
      <main className="min-w-0 flex-1 overflow-y-auto bg-muted/40">
        {children}
      </main>
    </div>
  );
}
