"use client";

import { create } from "zustand";

interface StopListState {
  selectedItemId: string | null;
  openPanel: (id: string) => void;
  closePanel: () => void;
}

export const useStopListStore = create<StopListState>((set) => ({
  selectedItemId: null,
  openPanel: (id) => set({ selectedItemId: id }),
  closePanel: () => set({ selectedItemId: null }),
}));
