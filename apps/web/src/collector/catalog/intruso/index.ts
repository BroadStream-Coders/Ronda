import { VenetianMask } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const intruso: CollectorType = {
  meta: {
    id: "intruso",
    name: "Intruso",
    description: "Encontrar el elemento que no encaja",
    icon: VenetianMask,
  },
  Editor,
};
