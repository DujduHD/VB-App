import { create } from "zustand";

export type AppView = "home" | "drafts" | "projects" | "settings";

interface NavigationState {
  view: AppView;
  menuOpen: boolean;
  setView: (view: AppView) => void;
  setMenuOpen: (open: boolean) => void;
  toggleMenu: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  view: "home",
  menuOpen: false,
  setView: (view) => set({ view, menuOpen: false }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  toggleMenu: () => set((s) => ({ menuOpen: !s.menuOpen })),
}));
