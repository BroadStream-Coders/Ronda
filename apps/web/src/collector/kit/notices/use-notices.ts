"use client";

import { create } from "zustand";

export type NoticeKind = "error" | "success" | "info";

export interface Notice {
  id: number;
  kind: NoticeKind;
  text: string;
}

const LIFETIME: Record<NoticeKind, number> = {
  error: 9000,
  success: 4000,
  info: 6000,
};

let nextId = 1;

interface NoticesState {
  notices: Notice[];
  push: (kind: NoticeKind, text: string) => void;
  dismiss: (id: number) => void;
}

export const useNotices = create<NoticesState>((set) => ({
  notices: [],
  push: (kind, text) => {
    const id = nextId++;
    set((state) => ({
      notices: [...state.notices.slice(-3), { id, kind, text }],
    }));
    setTimeout(() => {
      set((state) => ({ notices: state.notices.filter((n) => n.id !== id) }));
    }, LIFETIME[kind]);
  },
  dismiss: (id) =>
    set((state) => ({ notices: state.notices.filter((n) => n.id !== id) })),
}));

export function notifyError(text: string) {
  useNotices.getState().push("error", text);
}

export function notifySuccess(text: string) {
  useNotices.getState().push("success", text);
}

export function notifyInfo(text: string) {
  useNotices.getState().push("info", text);
}
