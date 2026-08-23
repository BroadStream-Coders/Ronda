import { notFound, redirect } from "next/navigation";

import { createClient } from "@/data/supabase/server";
import { getProgramBySlug } from "@/data/programs";
import { getProgramHostGames } from "@/data/program-services";
import { registry } from "@/collector/catalog/registry";
import { views } from "@/host/catalog/views";
import { HostMount } from "@/host/catalog/HostMount";

export default async function HostGamePage({
  params,
}: {
  params: Promise<{ slug: string; gameId: string }>;
}) {
  const { slug, gameId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const program = await getProgramBySlug(slug);
  if (!program) notFound();

  const assigned = getProgramHostGames(program.id).includes(gameId);
  if (!assigned || !views[gameId] || !registry[gameId]) notFound();

  return (
    <HostMount
      programId={program.id}
      gameId={gameId}
      name={registry[gameId].meta.name}
      backHref={`/programs/${slug}/host`}
    />
  );
}
