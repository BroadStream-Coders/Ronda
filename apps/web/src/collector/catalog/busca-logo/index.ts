import { Search } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const buscaLogo: CollectorType = {
  meta: {
    id: "busca-logo",
    name: "Busca el Logo",
    description: "Marca dónde van los logos en cada tablero",
    icon: Search,
  },
  Editor,
};
