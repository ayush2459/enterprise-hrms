import { create } from "zustand";
import Cookies from "js-cookie";
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
    // httpOnly cookies would be set server-side in a hardened deployment;
    // for the MVP scaffold these are readable client-side JS cookies with
    // a short access-token lifetime (Section 7: 15 min).
    Cookies.set("access_token", accessToken, { expires: 1 / 96, sameSite: "strict" });
    Cookies.set("refresh_token", refreshToken, { expires: 7, sameSite: "strict" });
  },

  logout: () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    set({ user: null, isAuthenticated: false });
  },
}));
