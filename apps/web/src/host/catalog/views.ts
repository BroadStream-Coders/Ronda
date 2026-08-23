import type { HostView } from "@/host/kit";

export const views: Record<string, () => Promise<HostView>> = {};

export const viewIds = Object.keys(views);
