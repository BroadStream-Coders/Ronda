import type { LayerPart } from "../layer";
import type { ImageFit } from "./image";

export interface VideoPart extends LayerPart {
  type: "video";
  src: string;
  fit?: ImageFit;
  muted?: boolean;
  loop?: boolean;
}

export function VideoView({ part }: { part: VideoPart }) {
  if (!part.src) return null;
  return (
    <video
      key={part.src}
      src={part.src}
      autoPlay
      playsInline
      loop={part.loop ?? true}
      muted={part.muted ?? true}
      className="h-full w-full"
      style={{ objectFit: part.fit ?? "fill" }}
    />
  );
}
