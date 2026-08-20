import { partView, type PartRegistry } from "../registry";
import { ColorView, type ColorPart } from "./color";
import { ImageView, type ImagePart } from "./image";

export type { ColorPart, ImagePart };

export const NATIVE_PARTS: PartRegistry = {
  color: partView<ColorPart>(ColorView),
  image: partView<ImagePart>(ImageView),
};
