import type { LayerPart } from "../layer";

export interface ColorPart extends LayerPart {
  type: "color";
  value: string;
}

export function ColorView({ part }: { part: ColorPart }) {
  return (
    <div className="h-full w-full" style={{ backgroundColor: part.value }} />
  );
}
