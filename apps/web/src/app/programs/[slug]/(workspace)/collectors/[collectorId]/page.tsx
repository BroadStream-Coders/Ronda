import { notFound, redirect } from "next/navigation";

import { CollectorTopbar, NoticeStack } from "@/collector/kit";
import { createClient } from "@/data/supabase/server";
import { getProgramBySlug } from "@/data/programs";
import { getProgramCollectors } from "@/collector/catalog/assignments";
import { registry } from "@/collector/catalog/registry";

export default async function CollectorPage({
  params,
}: {
  params: Promise<{ slug: string; collectorId: string }>;
}) {
  const { slug, collectorId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  const assigned = getProgramCollectors(program.id).includes(collectorId);
  const collector = registry[collectorId];
  if (!assigned || !collector) notFound();

  const Editor = collector.Editor;

  return (
    <div className="flex h-full flex-col">
      <CollectorTopbar programId={program.id} collectorId={collectorId} />
      <div className="min-h-0 flex-1">
        <Editor />
      </div>
      <NoticeStack />
    </div>
  );
}
