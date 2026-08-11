"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Download, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { adminService, type BackupInfo } from "@/services/admin.service";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DangerZoneCard() {
  const [step, setStep] = useState<"idle" | "confirm" | "done">("idle");
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  const loadBackups = () => {
    adminService
      .listBackups()
      .then(setBackups)
      .catch(() => setBackups([]));
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await adminService.resetAllData(password);
      setResultMessage(
        `${result.message} A backup was saved as "${result.backup_filename}" before anything was cleared.`
      );
      setStep("done");
      setPassword("");
      setConfirmText("");
      loadBackups();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Could not reset data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (filename: string) => {
    setDownloadingFile(filename);
    try {
      await adminService.downloadBackup(filename);
    } finally {
      setDownloadingFile(null);
    }
  };

  return (
    <Card className="border-red-100">
      <div className="mb-1 flex items-center gap-2">
        <AlertTriangle size={16} className="text-red-500" />
        <h2 className="text-sm font-semibold text-red-600">Danger Zone</h2>
      </div>
      <p className="mb-4 text-xs text-gray-500">
        Permanently clears every employee, document, and record in the system. A full backup is
        saved on the server automatically before anything is deleted. Your own login is kept so
        you aren&apos;t locked out.
      </p>

      {backups.length > 0 && (
        <div className="mb-4 rounded-md bg-surface-muted p-3">
          <p className="mb-2 text-xs font-medium text-gray-500">Available backups</p>
          <ul className="space-y-1.5">
            {backups.slice(0, 5).map((b) => (
              <li key={b.filename} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-gray-600">
                  {b.filename} <span className="text-gray-400">({formatSize(b.size_bytes)})</span>
                </span>
                <button
                  onClick={() => handleDownload(b.filename)}
                  disabled={downloadingFile === b.filename}
                  className="flex shrink-0 items-center gap-1 font-medium text-brand hover:underline disabled:opacity-50"
                >
                  <Download size={12} />
                  {downloadingFile === b.filename ? "..." : "Download"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {resultMessage && (
        <p className="mb-4 rounded-md bg-green-50 p-3 text-xs text-green-700">{resultMessage}</p>
      )}

      {step === "idle" && (
        <Button variant="danger" onClick={() => setStep("confirm")} className="flex items-center gap-2">
          <RotateCcw size={14} />
          Reset All Data
        </Button>
      )}

      {step === "confirm" && (
        <form onSubmit={handleReset} className="space-y-3 rounded-md border border-red-200 p-4">
          <p className="text-xs text-red-600">
            This cannot be undone from the app — only by restoring the backup file manually. Type{" "}
            <strong>RESET</strong> and confirm your password to proceed.
          </p>
          <Input
            id="reset_confirm_text"
            label='Type "RESET" to confirm'
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="RESET"
            required
          />
          <Input
            id="reset_password"
            label="Your Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setStep("idle");
                setError(null);
                setPassword("");
                setConfirmText("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              className="flex-1"
              disabled={loading || confirmText !== "RESET"}
            >
              {loading ? "Resetting..." : "Permanently Reset"}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}
