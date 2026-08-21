import { formatPath, isBlank, type ValidationIssue } from "@/collector/kit";

export interface Data {
  groups: { sentences: string[] }[];
}

export function validate(groups: string[][]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  groups.forEach((sentences, groupIndex) => {
    sentences.forEach((sentence, sentenceIndex) => {
      const path = formatPath(
        `Ronda ${groupIndex + 1}`,
        `Oración ${sentenceIndex + 1}`,
      );
      if (isBlank(sentence)) {
        issues.push({ path, message: "Falta la oración." });
      } else if (sentence.trim().split(/\s+/).length < 2) {
        issues.push({
          path,
          message: "La oración necesita al menos dos palabras.",
        });
      }
    });
  });
  return issues;
}

export function buildData(groups: string[][]): Data {
  return { groups: groups.map((sentences) => ({ sentences })) };
}

export function isData(data: unknown): data is Data {
  return (
    typeof data === "object" &&
    data !== null &&
    "groups" in data &&
    Array.isArray((data as Data).groups) &&
    (data as Data).groups.every((g) => g != null && Array.isArray(g.sentences))
  );
}
