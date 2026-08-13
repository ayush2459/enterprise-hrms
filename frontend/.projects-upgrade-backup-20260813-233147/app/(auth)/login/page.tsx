"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FileCheck2, HeartPulse, TrendingUp, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NetworkMotif } from "@/components/auth/NetworkMotif";
import { authService } from "@/services/auth.service";
import { useAuthStore } from "@/store/auth.store";

const FEATURES = [
  { icon: FileCheck2, label: "Documents" },
  { icon: Wallet, label: "Payroll" },
  { icon: HeartPulse, label: "Insurance" },
  { icon: TrendingUp, label: "Performance" },
];

export default function LoginPage() {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await authService.login(identifier, password);

      if (result.status === "success" && result.tokens) {
        setTokens(result.tokens.access_token, result.tokens.refresh_token);
        const me = await authService.me();
        setUser(me);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Brand panel — signature element */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-brand-dark px-12 py-10 text-white lg:flex">
        <div className="absolute inset-0 opacity-90">
          <NetworkMotif />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-brand-dark/70" />

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-light font-display text-base font-bold shadow-lift">
            H
          </div>
          <span className="font-display text-xl font-semibold tracking-tight">HRHub</span>
        </div>

        <div className="relative max-w-sm">
          <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight">
            One place for your whole team.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-300">
            People, documents, payroll, and performance — connected, not scattered
            across spreadsheets.
          </p>
        </div>

        <div className="relative flex flex-wrap gap-2">
          {FEATURES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300"
            >
              <Icon size={13} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center bg-surface-muted px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-light font-display text-base font-bold text-white shadow-lift">
              H
            </div>
            <span className="font-display text-xl font-semibold tracking-tight text-ink">HRHub</span>
          </div>

          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">Welcome back</h2>
          <p className="mt-1 text-sm text-ink-faint">Sign in with your official email or employee ID.</p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
            <Input
              id="identifier"
              label="Official Email or Employee ID"
              placeholder="you@company.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <Button type="submit" disabled={loading} className="mt-2 flex items-center justify-center gap-1.5">
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight size={15} />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
