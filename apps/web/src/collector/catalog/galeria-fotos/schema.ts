import type { ImageSlot } from "@/collector/kit";

export interface ColumnData {
  title: string;
  photos: ImageSlot[];
}

export interface Data {
  groups: { title: string; items: { imagePath: string }[] }[];
}

export const MAX_CAPACITY = 30;
export const SESSION_DATA_FILENAME = "sessionData.json";

export const uid = () => Math.random().toString(36).slice(2, 9);

export function createEmptyPhoto(): ImageSlot {
  return { id: uid() };
}

export function createEmptyColumn(): ColumnData {
  return { title: "", photos: [createEmptyPhoto()] };
}

export function buildData(columns: ColumnData[]): {
  data: Data;
  files: { name: string; file: File }[];
} {
  const files: { name: string; file: File }[] = [];

  const groups = columns.map((column, columnIndex) => ({
    title: column.title.trim(),
    items: column.photos.map((photo, photoIndex) => {
      if (!photo.file) return { imagePath: "" };
      const ext = photo.file.name.split(".").pop() || "png";
      const imagePath = `images/G${columnIndex + 1}_I${photoIndex + 1}.${ext}`;
      files.push({ name: imagePath, file: photo.file });
      return { imagePath };
    }),
  }));

  return { data: { groups }, files };
}

export function isData(data: unknown): data is Data {
  return (
    typeof data === "object" &&
    data !== null &&
    "groups" in data &&
    Array.isArray((data as Data).groups)
  );
}
