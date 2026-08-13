import { formatPath, isBlank, type ValidationIssue } from "@/collector/kit";

export interface Data {
  groups: { words: string[] }[];
}

export function validate(groups: string[][]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  groups.forEach((words, groupIndex) => {
    words.forEach((word, wordIndex) => {
      if (isBlank(word)) {
        issues.push({
          path: formatPath(
            `Ronda ${groupIndex + 1}`,
            `Palabra ${wordIndex + 1}`,
          ),
          message: "Falta la palabra.",
        });
      }
    });
  });
  return issues;
}

export function buildData(groups: string[][]): Data {
  return { groups: groups.map((words) => ({ words })) };
}

export function isData(data: unknown): data is Data {
  return (
    typeof data === "object" &&
    data !== null &&
    "groups" in data &&
    Array.isArray((data as Data).groups) &&
    (data as Data).groups.every((g) => g != null && Array.isArray(g.words))
  );
}
