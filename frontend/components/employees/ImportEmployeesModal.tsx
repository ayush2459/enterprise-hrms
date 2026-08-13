"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { employeeService } from "@/services/employee.service";
import type { EmployeeImportResult } from "@/types";

export function ImportEmployeesModal({
  onClose,
  onImported,
}: {
  onClose: () => void;
  onImported: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EmployeeImportResult | null>(null);

  const handleImport = async () => {
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const res = await employeeService.importFromExcel(file);
      setResult(res);
      onImported();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Could not import this file.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-brand-dark">Import Employees from Excel</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {!result ? (
            <>
              <p className="text-sm text-gray-500">
                Upload an .xlsx sheet with employee master data. Rows are matched to existing
                employees by Employee Number or Official Email — matched rows are updated,
                unmatched rows create a new employee (an official email is required to create one).
              </p>
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 px-6 py-8 text-center hover:border-brand">
                <Upload size={22} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  {file ? file.name : "Click to choose a .xlsx file"}
                </span>
                <input
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={!file || loading}
                  onClick={handleImport}
                >
                  {loading ? "Importing..." : "Import"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="rounded-lg bg-surface-muted p-3">
                  <p className="text-lg font-semibold text-brand-dark">{result.total_rows}</p>
                  <p className="text-xs text-gray-500">Rows</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3">
                  <p className="text-lg font-semibold text-green-700">{result.created}</p>
                  <p className="text-xs text-green-700">Created</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-3">
                  <p className="text-lg font-semibold text-blue-700">{result.updated}</p>
                  <p className="text-xs text-blue-700">Updated</p>
                </div>
                <div className="rounded-lg bg-amber-50 p-3">
                  <p className="text-lg font-semibold text-amber-700">{result.skipped}</p>
                  <p className="text-xs text-amber-700">Skipped</p>
                </div>
              </div>

              {result.errors.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-gray-500">Rows that need attention</p>
                  <div className="max-h-48 space-y-2 overflow-y-auto">
                    {result.errors.map((e, i) => (
                      <div key={i} className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-xs">
                        <span className="font-medium text-red-700">
                          Row {e.row} ({e.identifier}):
                        </span>{" "}
                        <span className="text-red-600">{e.error}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button type="button" className="w-full" onClick={onClose}>
                Done
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
