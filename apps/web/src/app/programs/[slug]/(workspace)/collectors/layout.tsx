import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { getProgramBySlug } from "@/data/programs";
import { hasService } from "@/data/program-services";

export default async function CollectorsLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program || !hasService(program.id, "collectors")) notFound();

  return children;
}
