import type { HostView } from "@/host/kit";

export const views: Record<string, () => Promise<HostView>> = {
  deletreo: () => import("./deletreo/View").then((m) => m.DeletreoView),
  "la-sabes-o-no": () =>
    import("./la-sabes-o-no/View").then((m) => m.LaSabesONoView),
};

export const viewIds = Object.keys(views);
