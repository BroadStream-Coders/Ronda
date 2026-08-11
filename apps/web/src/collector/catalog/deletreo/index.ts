import { SpellCheck } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const deletreo: CollectorType = {
  meta: {
    id: "deletreo",
    name: "Deletreo",
    description: "Palabras para deletrear, por rondas",
    icon: SpellCheck,
  },
  Editor,
};
