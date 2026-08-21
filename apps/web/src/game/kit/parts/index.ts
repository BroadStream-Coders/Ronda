import { partView, type PartRegistry } from "../registry";
import { BackdropView, type BackdropPart } from "./backdrop";
import { ColorView, type ColorPart } from "./color";
import { ImageView, type ImagePart } from "./image";
import { TextView, type TextPart } from "./text";

export type { BackdropPart, ColorPart, ImagePart, TextPart };

export const NATIVE_PARTS: PartRegistry = {
  backdrop: partView<BackdropPart>(BackdropView),
  color: partView<ColorPart>(ColorView),
  image: partView<ImagePart>(ImageView),
  text: partView<TextPart>(TextView),
};
