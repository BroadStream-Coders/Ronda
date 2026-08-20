import { notFound, redirect } from "next/navigation";

import { getProgramGames } from "@/game/catalog/assignments";
import { GameMount } from "@/game/catalog/GameMount";
import { registry } from "@/game/catalog/registry";
import { getProgramBySlug } from "@/data/programs";
import { createClient } from "@/data/supabase/server";

export default async function GamePage({
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

  const assigned = getProgramGames(program.id).includes(gameId);
  if (!assigned || !registry[gameId]) notFound();

  return <GameMount gameId={gameId} />;
}
