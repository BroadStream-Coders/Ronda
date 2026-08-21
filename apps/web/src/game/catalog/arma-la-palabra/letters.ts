const graphemes = new Intl.Segmenter("es", { granularity: "grapheme" });

export function splitLetters(word: string): string[] {
  const clean = word.replace(/[\s\p{C}]/gu, "").toUpperCase();
  return [...graphemes.segment(clean)].map((piece) => piece.segment);
}
