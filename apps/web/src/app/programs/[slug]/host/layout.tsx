import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";

import { createClient } from "@/data/supabase/server";
import { getProgramBySlug } from "@/data/programs";
import { hasService } from "@/data/program-services";

export default async function HostLayout({
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
  if (!program || !hasService(program.id, "host")) notFound();

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-muted/40">
      {children}
    </div>
  );
}
