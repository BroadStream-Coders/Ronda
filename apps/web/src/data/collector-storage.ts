"use client";

import { createClient } from "./supabase/client";

const BUCKET = "collector-data";
const FILENAME = "session.json";

function sessionPath(programId: string, collectorId: string): string {
  return `${programId}/${collectorId}/${FILENAME}`;
}

export async function uploadCollectorData(
  programId: string,
  collectorId: string,
  data: unknown,
): Promise<void> {
  const supabase = createClient();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(sessionPath(programId, collectorId), blob, {
      upsert: true,
      contentType: "application/json",
      cacheControl: "0",
    });

  if (error) throw error;
}

export async function downloadCollectorData(
  programId: string,
  collectorId: string,
): Promise<File | null> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .download(sessionPath(programId, collectorId));

  if (error || !data) return null;
  return new File([data], FILENAME, { type: "application/json" });
}
