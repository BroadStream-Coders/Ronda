import { partView, type PartRegistry } from "../registry";
import { ColorView, type ColorPart } from "./color";

export type { ColorPart };

export const NATIVE_PARTS: PartRegistry = {
  color: partView<ColorPart>(ColorView),
};
