import { create } from "zustand";

export const useStore = create((set) => ({
  // Bumped after every successful write so open screens refetch.
  refreshKey: 0,
  bumpRefresh: () => set((state) => ({ refreshKey: state.refreshKey + 1 })),

  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  // Global modals: { name: "account" | "transaction" | "transfer", props }
  modal: null,
  openModal: (name, props = {}) => set({ modal: { name, props } }),
  closeModal: () => set({ modal: null }),
}));
