import { DESIGN_WIDTH, type LayerPart } from "@/game/kit";

export interface SpellingPart extends LayerPart {
  type: "spelling";
  word: string;
  revealed: number;
  fontSize: number;
  letterSpacing: number;
}

export function SpellingView({ part }: { part: SpellingPart }) {
  return (
    <div
      className="flex h-full w-full items-center justify-center uppercase leading-none text-white"
      style={{
        fontSize: `${(part.fontSize / DESIGN_WIDTH) * 100}cqw`,
        gap: `${(part.letterSpacing / DESIGN_WIDTH) * 100}cqw`,
      }}
    >
      {part.word.split("").map((char, index) => (
        <span
          key={index}
          className="inline-flex flex-col items-center leading-none"
        >
          <span className="leading-none">{char}</span>
          <span
            className="bg-current"
            style={{
              width: "0.7em",
              height: "0.09em",
              opacity: index < part.revealed ? 1 : 0,
            }}
          />
        </span>
      ))}
    </div>
  );
}
