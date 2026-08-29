import { partView, type PartRegistry } from "../registry";
import { BackdropView, type BackdropPart } from "./backdrop";
import { ColorView, type ColorPart } from "./color";
import { HoloView, type HoloPart } from "./holo";
import { ImageView, type ImagePart } from "./image";
import { ShimmerView, type ShimmerPart } from "./shimmer";
import { TextView, type TextPart } from "./text";
import { VideoView, type VideoPart } from "./video";

export type {
  BackdropPart,
  ColorPart,
  HoloPart,
  ImagePart,
  ShimmerPart,
  TextPart,
  VideoPart,
};
export { maskStyle, type MaskPart } from "./mask";

export const NATIVE_PARTS: PartRegistry = {
  backdrop: partView<BackdropPart>(BackdropView),
  color: partView<ColorPart>(ColorView),
  holo: partView<HoloPart>(HoloView),
  image: partView<ImagePart>(ImageView),
  shimmer: partView<ShimmerPart>(ShimmerView),
  text: partView<TextPart>(TextView),
  video: partView<VideoPart>(VideoView),
};
