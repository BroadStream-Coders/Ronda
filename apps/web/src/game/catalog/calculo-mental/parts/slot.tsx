import type { LayerPart } from "@/game/kit";
import { FRAMES } from "../assets";

export type SlotStatus = "none" | "correct" | "incorrect";

export interface SlotPart extends LayerPart {
  type: "slot";
  status: SlotStatus;
}

function frameStyle(
  centerLeft: string,
  centerTop: string,
  width: string,
  height: string,
  src: string,
) {
  return {
    position: "absolute" as const,
    left: `calc(${centerLeft} - ${width} / 2)`,
    top: `calc(${centerTop} - ${height} / 2)`,
    width,
    height,
    backgroundImage: `url(${src})`,
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat" as const,
  };
}

export function SlotView({ part }: { part: SlotPart }) {
  return (
    <div className="absolute inset-0">
      <div
        style={frameStyle("47.33%", "34.5%", "94.66%", "69%", FRAMES.blue)}
      />
      <div
        style={frameStyle("68.54%", "75.79%", "62.93%", "48.41%", FRAMES.purple)}
      />
      {part.status === "correct" && (
        <div
          style={frameStyle("95.84%", "4.06%", "25.17%", "45.63%", FRAMES.check)}
        />
      )}
      {part.status === "incorrect" && (
        <div
          style={frameStyle("93.65%", "3.78%", "20.79%", "40.62%", FRAMES.x)}
        />
      )}
    </div>
  );
}
