import { api } from "@/lib/api";

export interface DataResetResult {
  backup_filename: string;
  tables_cleared: string[];
  users_removed: number;
  message: string;
}

export interface BackupInfo {
  filename: string;
  size_bytes: number;
  created_at: string;
}

export const adminService = {
  async resetAllData(password: string) {
    const { data } = await api.post<DataResetResult>("/admin/data-reset", {
      password,
      confirm: "RESET",
    });
    return data;
  },

  async listBackups() {
    const { data } = await api.get<BackupInfo[]>("/admin/backups");
    return data;
  },

  async downloadBackup(filename: string) {
    // Auth is a Bearer header (not a cookie the browser attaches
    // automatically), so a plain <a href> to the API would 401 — fetch it
    // as a blob through the authenticated axios instance instead, then
    // hand the browser a local object URL to save.
    const response = await api.get(`/admin/backups/${encodeURIComponent(filename)}/download`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
