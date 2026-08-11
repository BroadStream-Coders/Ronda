export const assignments: Record<string, string[]> = {
  "que-gane-el-mejor": ["deletreo"],
};

export function getProgramCollectors(slug: string): string[] {
  return assignments[slug] ?? [];
}
