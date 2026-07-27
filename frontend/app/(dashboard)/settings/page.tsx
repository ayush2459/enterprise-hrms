"use client";

import { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { accountService } from "@/services/account.service";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();

  const refreshUser = async () => {
    const me = await authService.me();
    setUser(me);
  };

  // ---- Change email ----
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
      await refreshUser();
      setEmailSuccess(true);
      setNewEmail("");
      setEmailPassword("");
    } catch (err: any) {
      setEmailError(err?.response?.data?.detail ?? "Could not update email.");
    } finally {
      setEmailLoading(false);
    }
  };

  // ---- Change password ----
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

  // ---- MFA ----
  const [mfaStep, setMfaStep] = useState<"idle" | "setup" | "disable">("idle");
  const [secret, setSecret] = useState("");
  const [provisioningUri, setProvisioningUri] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState<string | null>(null);

  const startSetup = async () => {
    setMfaError(null);
    setMfaLoading(true);
    try {
      const result = await accountService.setupMfa();
      setSecret(result.secret);
      setProvisioningUri(result.provisioning_uri);
      setMfaStep("setup");
    } catch (err: any) {
      setMfaError(err?.response?.data?.detail ?? "Could not start MFA setup.");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError(null);
    setMfaLoading(true);
    try {
      await accountService.verifyMfa(mfaCode);
      await refreshUser();
      setMfaStep("idle");
      setMfaCode("");
    } catch (err: any) {
      setMfaError(err?.response?.data?.detail ?? "Invalid code.");
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaError(null);
    setMfaLoading(true);
    try {
      await accountService.disableMfa(disablePassword);
      await refreshUser();
      setMfaStep("idle");
      setDisablePassword("");
    } catch (err: any) {
      setMfaError(err?.response?.data?.detail ?? "Could not disable MFA.");
    } finally {
      setMfaLoading(false);
    }
  };

  return (
    <>
      <Topbar title="Settings" subtitle="Account and security settings" />
      <div className="p-8 space-y-6 max-w-xl">
        <Card>
          <h2 className="mb-1 text-sm font-semibold text-brand-dark">Change Email</h2>
          <p className="mb-4 text-xs text-gray-500">
            Current: {user?.official_email}. Use your new email to sign in next time.
          </p>
          <form onSubmit={handleChangeEmail} className="space-y-4">
            <Input
              id="new_email"
              label="New Email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            <Input
              id="email_password"
              label="Confirm Password"
              type="password"
              value={emailPassword}
              onChange={(e) => setEmailPassword(e.target.value)}
              required
            />
            {emailError && <p className="text-sm text-red-500">{emailError}</p>}
            {emailSuccess && (
              <p className="text-sm text-green-600">
                Email updated — use your new email next time you sign in.
              </p>
            )}
            <Button type="submit" disabled={emailLoading}>
              {emailLoading ? "Updating..." : "Update Email"}
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-brand-dark">Change Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              id="current_password"
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              id="new_password"
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <p className="text-xs text-gray-400">Minimum 10 characters.</p>
            {pwError && <p className="text-sm text-red-500">{pwError}</p>}
            {pwSuccess && <p className="text-sm text-green-600">Password updated.</p>}
            <Button type="submit" disabled={pwLoading}>
              {pwLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="mb-1 text-sm font-semibold text-brand-dark">Two-Factor Authentication</h2>
          <p className="mb-4 text-xs text-gray-500">
            Optional. Adds a 6-digit code step when signing in.
          </p>

          {user?.mfa_enabled ? (
            <div className="space-y-3">
              <p className="text-sm text-green-600">MFA is currently enabled.</p>
              {mfaStep === "disable" ? (
                <form onSubmit={handleDisable} className="space-y-3">
                  <Input
                    id="disable_password"
                    label="Confirm your password"
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    required
                  />
                  {mfaError && <p className="text-sm text-red-500">{mfaError}</p>}
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => setMfaStep("idle")}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={mfaLoading}>
                      {mfaLoading ? "Disabling..." : "Disable MFA"}
                    </Button>
                  </div>
                </form>
              ) : (
                <Button variant="secondary" onClick={() => setMfaStep("disable")}>
                  Disable MFA
                </Button>
              )}
            </div>
          ) : mfaStep === "setup" ? (
            <form onSubmit={handleVerify} className="space-y-3">
              <div className="rounded-md bg-surface-muted p-3 text-xs">
                <p className="mb-1 text-gray-500">Manual entry secret:</p>
                <p className="font-mono text-brand-dark break-all">{secret}</p>
                <p className="mt-2 text-gray-500">
                  Scan the provisioning URI below with an authenticator app, or paste the secret manually.
                </p>
                <p className="mt-1 break-all text-gray-400">{provisioningUri}</p>
              </div>
              <Input
                id="mfa_code"
                label="Enter the 6-digit code from your app"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                maxLength={6}
                required
              />
              {mfaError && <p className="text-sm text-red-500">{mfaError}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => setMfaStep("idle")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={mfaLoading}>
                  {mfaLoading ? "Verifying..." : "Verify & Enable"}
                </Button>
              </div>
            </form>
          ) : (
            <Button onClick={startSetup} disabled={mfaLoading}>
              {mfaLoading ? "Starting..." : "Enable MFA"}
            </Button>
          )}
        </Card>
      </div>
    </>
  );
}
