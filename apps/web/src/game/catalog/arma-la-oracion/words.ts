export function splitWords(sentence: string): string[] {
  return sentence
    .split(/\s+/u)
    .map((word) => word.replace(/\p{C}/gu, ""))
    .filter((word) => word.length > 0);
}
