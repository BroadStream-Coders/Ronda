import { Shuffle } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const cubigrama: CollectorType = {
  meta: {
    id: "cubigrama",
    name: "Cubigrama",
    description: "Palabras ocultas que se arman con las mismas letras",
    icon: Shuffle,
  },
  Editor,
};
