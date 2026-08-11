export const assignments: Record<string, string[]> = {
  "que-gane-el-mejor": ["deletreo", "calculo-mental"],
};

export function getProgramCollectors(slug: string): string[] {
  return assignments[slug] ?? [];
}
