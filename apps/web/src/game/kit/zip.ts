import JSZip from "jszip";

export const ZIP_SESSION_JSON = "sessionData.json";

export interface ZipSession {
  data: unknown;
  images: Record<string, Blob>;
}

export async function readZipSession(file: File): Promise<ZipSession> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(await file.arrayBuffer());
  } catch {
    throw new Error("No se pudo leer el archivo ZIP.");
  }

  const entry = zip.file(ZIP_SESSION_JSON);
  if (!entry) {
    throw new Error(`El paquete no trae ${ZIP_SESSION_JSON}.`);
  }

  const data: unknown = JSON.parse(await entry.async("string"));

  const images: Record<string, Blob> = {};
  await Promise.all(
    Object.values(zip.files)
      .filter(
        (candidate) => !candidate.dir && candidate.name !== ZIP_SESSION_JSON,
      )
      .map(async (candidate) => {
        images[candidate.name] = await candidate.async("blob");
      }),
  );

  return { data, images };
}
