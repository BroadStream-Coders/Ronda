import type { CSSProperties } from "react";

import type { LayerPart } from "../layer";
import { resolveMedia } from "../media";
import type { ImageFit } from "./image";

export interface MaskPart extends LayerPart {
  type: "mask";
  showImage?: boolean;
}

export function maskStyle(src: string, fit: ImageFit = "fill"): CSSProperties {
  const image = `url("${resolveMedia(src)}")`;
  const size = fit === "fill" ? "100% 100%" : fit;
  return {
    maskImage: image,
    WebkitMaskImage: image,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
    maskSize: size,
    WebkitMaskSize: size,
  };
}
