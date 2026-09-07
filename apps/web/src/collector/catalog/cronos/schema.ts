import {
  emptyImageSlot,
  formatPath,
  hasImage,
  isBlank,
  type ImageSlot,
  type ValidationIssue,
} from "@/collector/kit";

export interface RowData {
  id: string;
  date: string;
  title: string;
  image: ImageSlot;
}

export interface ExportItem {
  date: string;
  title: string;
  imagePath: string;
}

export interface ExportGroup {
  title: string;
  items: ExportItem[];
}

export interface Data {
  groups: ExportGroup[];
}

export const COLUMN_SIZE = 5;

const uid = () => Math.random().toString(36).slice(2, 9);

export function createEmptyRow(): RowData {
  return { id: uid(), date: "", title: "", image: emptyImageSlot() };
}

export function fitRows(rows: RowData[]): RowData[] {
  const fitted = rows.slice(0, COLUMN_SIZE);
  while (fitted.length < COLUMN_SIZE) fitted.push(createEmptyRow());
  return fitted;
}

export function createFullColumn(): RowData[] {
  return fitRows([]);
}

export function validate(
  groups: RowData[][],
  titles: string[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  groups.forEach((items, groupIndex) => {
    const groupLabel = `Ronda ${groupIndex + 1}`;
    if (isBlank(titles[groupIndex])) {
      issues.push({
        path: formatPath(groupLabel, "Pregunta / Título"),
        message: "Falta la pregunta / título de la ronda.",
      });
    }
    items.forEach((item, itemIndex) => {
      const rowLabel = `Evento ${itemIndex + 1}`;
      if (isBlank(item.date)) {
        issues.push({
          path: formatPath(groupLabel, rowLabel, "Fecha"),
          message: "Falta la fecha.",
        });
      }
      if (isBlank(item.title)) {
        issues.push({
          path: formatPath(groupLabel, rowLabel, "Título"),
          message: "Falta el título.",
        });
      }
      if (!hasImage(item.image)) {
        issues.push({
          path: formatPath(groupLabel, rowLabel, "Imagen"),
          message: "Falta la imagen.",
        });
      }
    });
  });
  return issues;
}
