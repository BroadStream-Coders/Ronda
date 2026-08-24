import type { HostView } from "@/host/kit";

export const views: Record<string, () => Promise<HostView>> = {
  deletreo: () => import("./deletreo/View").then((m) => m.DeletreoView),
};

export const viewIds = Object.keys(views);
