import type JSZip from "jszip";

import type { ImageSlot } from "./types";

const uid = () => Math.random().toString(36).slice(2, 9);

export function emptyImageSlot(): ImageSlot {
  return { id: uid() };
}

export function hasImage(slot: ImageSlot | undefined): boolean {
  return Boolean(slot?.file || slot?.url);
}

export function setSlotImage<T extends ImageSlot>(
  slot: T,
  file: File,
  url: string,
): T {
  if (slot.url && slot.url !== url) URL.revokeObjectURL(slot.url);
  return { ...slot, file, url };
}

export function clearSlotImage<T extends ImageSlot>(slot: T): T {
  if (slot.url) URL.revokeObjectURL(slot.url);
  return { ...slot, file: undefined, url: undefined };
}

export function releaseSlots(slots: (ImageSlot | undefined)[]): void {
  slots.forEach((slot) => {
    if (slot?.url) URL.revokeObjectURL(slot.url);
  });
}

export function createImagePacker() {
  const files: { name: string; file: File }[] = [];

  return {
    files,
    add(slot: ImageSlot | undefined, ...parts: (string | number)[]): string {
      if (!slot?.file) return "";
      const ext = slot.file.name.split(".").pop() || "png";
      const name = `images/${parts.join("_")}.${ext}`;
      files.push({ name, file: slot.file });
      return name;
    },
  };
}

export async function readImageSlot(
  zip: JSZip,
  path?: string,
): Promise<ImageSlot> {
  if (!path) return emptyImageSlot();

  const entry = zip.file(path);
  if (!entry) return emptyImageSlot();

  const blob = await entry.async("blob");
  return {
    id: uid(),
    file: new File([blob], path.split("/").pop() || "image.png", {
      type: blob.type || "image/png",
    }),
    url: URL.createObjectURL(blob),
  };
}
