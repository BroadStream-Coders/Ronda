import { partView, type PartRegistry } from "../registry";
import { ColorView, type ColorPart } from "./color";
import { ImageView, type ImagePart } from "./image";
import { TextView, type TextPart } from "./text";

export type { ColorPart, ImagePart, TextPart };

export const NATIVE_PARTS: PartRegistry = {
  color: partView<ColorPart>(ColorView),
  image: partView<ImagePart>(ImageView),
  text: partView<TextPart>(TextView),
};
