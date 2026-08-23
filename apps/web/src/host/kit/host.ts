import type { ComponentType } from "react";

export interface HostViewProps {
  session: unknown;
}

export type HostView = ComponentType<HostViewProps>;
