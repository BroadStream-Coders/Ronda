export interface RowData {
  id: string;
  date: string;
  title: string;
  file?: File;
  url?: string;
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
  return { id: uid(), date: "", title: "" };
}

export function createFullColumn(): RowData[] {
  return Array.from({ length: COLUMN_SIZE }, createEmptyRow);
}
