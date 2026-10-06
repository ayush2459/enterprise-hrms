import { create } from "zustand";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setTokens: (accessToken, refreshToken) => {
    // sessionStorage instead of cookies: it's scoped per-tab, not shared
    // across the whole browser, so HR/Manager/Employee can each be logged
    // in simultaneously in different tabs of the same browser. A cookie
    // (or localStorage) would overwrite the same session in every tab.
    if (typeof window !== "undefined") {
      sessionStorage.setItem("access_token", accessToken);
      sessionStorage.setItem("refresh_token", refreshToken);
    }
  },

  logout: () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("access_token");
      sessionStorage.removeItem("refresh_token");
    }
    set({ user: null, isAuthenticated: false });
  },
}));
