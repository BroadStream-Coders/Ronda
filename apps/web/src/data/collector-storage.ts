"use client";

import JSZip from "jszip";

import { createClient } from "./supabase/client";

const BUCKET = "collector-data";
const REMOTE_JSON = "session.json";
const ZIP_JSON = "sessionData.json";
const IMAGES_DIR = "images";

const PAGE_SIZE = 100;

function prefix(programId: string, collectorId: string): string {
  return `${programId}/${collectorId}`;
}

type Storage = ReturnType<ReturnType<typeof createClient>["storage"]["from"]>;

async function listImages(storage: Storage, base: string): Promise<string[]> {
  const names: string[] = [];

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await storage.list(`${base}/${IMAGES_DIR}`, {
      limit: PAGE_SIZE,
      offset,
    });
    if (error || !data) break;

    names.push(...data.map((object) => object.name));
    if (data.length < PAGE_SIZE) break;
  }

  return names;
}

export async function uploadCollectorData(
  programId: string,
  collectorId: string,
  data: unknown,
  files: { name: string; file: File }[] = [],
): Promise<void> {
  const supabase = createClient();
  const base = prefix(programId, collectorId);
  const storage = supabase.storage.from(BUCKET);

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const { error } = await storage.upload(`${base}/${REMOTE_JSON}`, blob, {
    upsert: true,
    contentType: "application/json",
    cacheControl: "0",
  });
  if (error) throw error;

  const uploads = await Promise.all(
    files.map((item) =>
      storage.upload(`${base}/${item.name}`, item.file, {
        upsert: true,
        contentType: item.file.type,
        cacheControl: "0",
      }),
    ),
  );

  const failed = uploads.find((result) => result.error);
  if (failed?.error) throw failed.error;

  const keep = new Set(files.map((item) => item.name.split("/").pop()));
  const stale = (await listImages(storage, base))
    .filter((name) => !keep.has(name))
    .map((name) => `${base}/${IMAGES_DIR}/${name}`);

  if (stale.length > 0) await storage.remove(stale);
}

export async function downloadCollectorData(
  programId: string,
  collectorId: string,
  format: "json" | "zip",
): Promise<File | null> {
  const supabase = createClient();
  const base = prefix(programId, collectorId);
  const storage = supabase.storage.from(BUCKET);

  const { data: json, error } = await storage.download(
    `${base}/${REMOTE_JSON}`,
  );
  if (error || !json) return null;

  if (format === "json") {
    return new File([json], REMOTE_JSON, { type: "application/json" });
  }

  const zip = new JSZip();
  zip.file(ZIP_JSON, json);

  const names = await listImages(storage, base);
  const images = await Promise.all(
    names.map(async (name) => ({
      name,
      blob: (await storage.download(`${base}/${IMAGES_DIR}/${name}`)).data,
    })),
  );

  for (const image of images) {
    if (image.blob) zip.file(`${IMAGES_DIR}/${image.name}`, image.blob);
  }

  const bundle = await zip.generateAsync({ type: "blob" });
  return new File([bundle], "session.zip", { type: "application/zip" });
}
