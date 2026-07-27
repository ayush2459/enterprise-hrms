import { api } from "@/lib/api";
import type { LoginResponse, User } from "@/types";

export const authService = {
  async login(identifier: string, password: string, mfaCode?: string) {
    const { data } = await api.post<LoginResponse>("/auth/login", {
      identifier,
      password,
      mfa_code: mfaCode,
    });
    return data;
  },

  async me() {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },

  async refresh(refreshToken: string) {
    const { data } = await api.post("/auth/refresh", { refresh_token: refreshToken });
    return data;
  },
};
