export function parseExcelPaste(text: string): string[][] {
  if (!text) return [];

  return text.split(/\r?\n/).reduce((acc, row) => {
    if (row.length > 0) {
      acc.push(row.split("\t").map((cell) => cell.trim()));
    }
    return acc;
  }, [] as string[][]);
}

export function getColumnData(data: string[][], columnIndex = 0): string[] {
  const result: string[] = [];
  for (const row of data) {
    const cell = row[columnIndex];
    if (cell !== undefined && cell !== null) {
      result.push(cell);
    }
  }
  return result;
}
