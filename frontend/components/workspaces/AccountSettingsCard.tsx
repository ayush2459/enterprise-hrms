"use client";

import { useState } from "react";
import { accountService } from "@/services/account.service";
import { authService } from "@/services/auth.service";
import type { User } from "@/types";

export function AccountSettingsCard({
  user,
  onUserUpdated,
}: {
  user: User | null;
  onUserUpdated: (u: User) => void;
}) {
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState(false);

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(false);
    setEmailLoading(true);
    try {
      await accountService.changeEmail(newEmail, emailPassword);
      const me = await authService.me();
      onUserUpdated(me);
      setEmailSuccess(true);
      setNewEmail("");
      setEmailPassword("");
    } catch (err: any) {
      setEmailError(err?.response?.data?.detail ?? "Could not update email.");
    } finally {
      setEmailLoading(false);
    }
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);
    setPwLoading(true);
    try {
      await accountService.changePassword(currentPassword, newPassword);
      setPwSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      setPwError(err?.response?.data?.detail ?? "Could not update password.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-bold">Change email</h3>
        <p className="mt-1 text-[10px] text-slate-400">
          Current: {user?.official_email ?? "—"}. Use your new email to sign in next time.
        </p>
        <form onSubmit={handleChangeEmail} className="mt-4 space-y-3">
          <label className="block text-[11px] font-semibold text-slate-600">
            New email
            <input type="email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs" />
          </label>
          <label className="block text-[11px] font-semibold text-slate-600">
            Confirm password
            <input type="password" required value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs" />
          </label>
          {emailError && <p className="text-xs text-red-500">{emailError}</p>}
          {emailSuccess && <p className="text-xs text-emerald-600">Email updated — use your new email next time you sign in.</p>}
          <button type="submit" disabled={emailLoading} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
            {emailLoading ? "Updating..." : "Update email"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="text-sm font-bold">Change password</h3>
        <p className="mt-1 text-[10px] text-slate-400">Minimum 10 characters.</p>
        <form onSubmit={handleChangePassword} className="mt-4 space-y-3">
          <label className="block text-[11px] font-semibold text-slate-600">
            Current password
            <input type="password" required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs" />
          </label>
          <label className="block text-[11px] font-semibold text-slate-600">
            New password
            <input type="password" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs" />
          </label>
          {pwError && <p className="text-xs text-red-500">{pwError}</p>}
          {pwSuccess && <p className="text-xs text-emerald-600">Password updated.</p>}
          <button type="submit" disabled={pwLoading} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
            {pwLoading ? "Updating..." : "Update password"}
          </button>
        </form>
      </section>
    </div>
  );
}
