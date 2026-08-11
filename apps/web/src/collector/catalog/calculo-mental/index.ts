import { Calculator } from "lucide-react";

import type { CollectorType } from "../registry";
import { Editor } from "./Editor";

export const calculoMental: CollectorType = {
  meta: { id: "calculo-mental", name: "Cálculo Mental", icon: Calculator },
  Editor,
};
