import { History } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const cronos: CollectorType = {
  meta: {
    id: "cronos",
    name: "Cronos",
    description: "Eventos con fecha, título e imagen",
    icon: History,
  },
  Editor,
};
