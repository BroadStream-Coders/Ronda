"use client";

import { createContext, useContext } from "react";

export interface GameFont {
  className: string;
}

export type FontRegistry = Record<string, GameFont>;

const FontRegistryContext = createContext<FontRegistry>({});

export const FontRegistryProvider = FontRegistryContext.Provider;

export function useFontRegistry(): FontRegistry {
  return useContext(FontRegistryContext);
}
