import { api } from "@/lib/api";
import type { MFASetupResponse } from "@/types";

export const accountService = {
  async changePassword(currentPassword: string, newPassword: string) {
    const { data } = await api.post("/account/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return data;
  },

  async changeEmail(newEmail: string, password: string) {
    const { data } = await api.post("/account/change-email", {
      new_email: newEmail,
      password,
    });
    return data;
  },

  async setupMfa() {
    const { data } = await api.post<MFASetupResponse>("/account/mfa/setup");
    return data;
  },

  async verifyMfa(code: string) {
    const { data } = await api.post("/account/mfa/verify", { code });
    return data;
  },

  async disableMfa(password: string) {
    const { data } = await api.post("/account/mfa/disable", { password });
    return data;
  },
};
