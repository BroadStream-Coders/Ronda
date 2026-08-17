"use client";

import { create } from "zustand";
import type { ReactNode } from "react";

import type { ValidationIssue } from "../validation/validation";

interface WorkspaceHeaderState {
  title: string | null;
  icon: ReactNode | null;
  format?: "json" | "zip";
  onSave?: () => void;
  onLoad?: (file: File) => void;
  validate?: () => ValidationIssue[];
  getData?: () => unknown;
  setHeader: (
    header: Omit<WorkspaceHeaderState, "setHeader" | "resetHeader">,
  ) => void;
  resetHeader: () => void;
}

export const useWorkspaceHeader = create<WorkspaceHeaderState>((set) => ({
  title: null,
  icon: null,
  format: undefined,
  onSave: undefined,
  onLoad: undefined,
  validate: undefined,
  getData: undefined,
  setHeader: (header) => set((state) => ({ ...state, ...header })),
  resetHeader: () =>
    set({
      title: null,
      icon: null,
      format: undefined,
      onSave: undefined,
      onLoad: undefined,
      validate: undefined,
      getData: undefined,
    }),
}));
