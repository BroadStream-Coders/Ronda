import type { LayerPart } from "../layer";

export type ImageFit = "contain" | "cover" | "fill";

export interface ImagePart extends LayerPart {
  type: "image";
  src: string;
  fit?: ImageFit;
}

export function ImageView({ part }: { part: ImagePart }) {
  if (!part.src) return null;
  const fit = part.fit ?? "fill";
  return (
    <div
      className="h-full w-full bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${part.src})`,
        backgroundSize: fit === "fill" ? "100% 100%" : fit,
      }}
    />
  );
}
