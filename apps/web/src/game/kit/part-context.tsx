"use client";

import { createContext, useContext } from "react";

import type { PartRegistry } from "./registry";

const PartRegistryContext = createContext<PartRegistry>({});

export const PartRegistryProvider = PartRegistryContext.Provider;

export function usePartRegistry(): PartRegistry {
  return useContext(PartRegistryContext);
}
