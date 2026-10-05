"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, LockKeyhole } from "lucide-react";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!username.trim()) {
      setError("Please enter your username or official email.");
      return;
    }

    if (!password) {
      setError("Please enter a new password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/backend/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: username.trim(),
          new_password: password,
          confirm_password: confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const detail = data?.detail;

        if (Array.isArray(detail)) {
          setError(
            detail
              .map((item: any) => item?.msg || "Invalid request")
              .join(", ")
          );
        } else {
          setError(
            typeof detail === "string"
              ? detail
              : "Unable to update password."
          );
        }

        return;
      }

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface-muted flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">

          {/* Back to Login */}
          <div className="mb-7">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-ink-faint hover:text-ink transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>

          {/* Header */}
          <div className="mb-7">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <LockKeyhole size={23} />
            </div>

            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
              Reset Password
            </h1>

            <p className="mt-2 text-sm leading-6 text-ink-faint">
              Enter your account details and create a new password for your
              HR Portal account.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-ink"
              >
                Username or Official Email
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username or email"
                autoComplete="username"
                required
                className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-ink"
              >
                New Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 pr-12 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              <p className="mt-1.5 text-xs text-ink-faint">
                Minimum 8 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-ink"
              >
                Confirm Password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-lg border border-border bg-surface px-4 py-3 pr-12 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
                <p className="font-semibold">
                  Password updated successfully.
                </p>
                <p className="mt-1">
                  Your password has been updated. You can now sign in with
                  your new password.
                </p>

                <Link
                  href="/login"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Create Password */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Password..." : "Create Password"}
            </button>
          </form>

          {/* Sign In */}
          <div className="mt-6 text-center">
            <span className="text-sm text-ink-faint">
              Remember your password?{" "}
            </span>

            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
