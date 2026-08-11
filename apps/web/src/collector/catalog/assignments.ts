export const assignments: Record<string, string[]> = {
  "que-gane-el-mejor": ["deletreo", "calculo-mental", "si-o-no"],
};

export function getProgramCollectors(slug: string): string[] {
  return assignments[slug] ?? [];
}
