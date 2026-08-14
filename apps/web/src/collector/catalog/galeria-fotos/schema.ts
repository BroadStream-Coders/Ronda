import {
  createImagePacker,
  emptyImageSlot,
  formatPath,
  hasImage,
  type ImageSlot,
  type ValidationIssue,
} from "@/collector/kit";

export interface ColumnData {
  title: string;
  photos: ImageSlot[];
}

export interface Data {
  groups: { title: string; items: { imagePath: string }[] }[];
}

export const MAX_CAPACITY = 30;
export const SESSION_DATA_FILENAME = "sessionData.json";

export function createEmptyPhoto(): ImageSlot {
  return emptyImageSlot();
}

export function createEmptyColumn(): ColumnData {
  return { title: "", photos: [createEmptyPhoto()] };
}

export function buildData(columns: ColumnData[]): {
  data: Data;
  files: { name: string; file: File }[];
} {
  const packer = createImagePacker();

  const groups = columns.map((column, columnIndex) => ({
    title: column.title.trim(),
    items: column.photos.map((photo, photoIndex) => ({
      imagePath: packer.add(photo, `G${columnIndex + 1}`, `I${photoIndex + 1}`),
    })),
  }));

  return { data: { groups }, files: packer.files };
}

export function validate(columns: ColumnData[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  columns.forEach((column, columnIndex) => {
    const groupLabel = column.title.trim() || `Grupo ${columnIndex + 1}`;
    column.photos.forEach((photo, photoIndex) => {
      if (!hasImage(photo)) {
        issues.push({
          path: formatPath(groupLabel, `Foto ${photoIndex + 1}`),
          message: "Falta la imagen.",
        });
      }
    });
  });
  return issues;
}

export function isData(data: unknown): data is Data {
  return (
    typeof data === "object" &&
    data !== null &&
    "groups" in data &&
    Array.isArray((data as Data).groups)
  );
}
