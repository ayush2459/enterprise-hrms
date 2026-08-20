"use client";

import { useState } from "react";
import { assetService } from "@/services/asset.service";
import type { Asset } from "@/types";

interface Props {
  employeeId: string;
  assets: Asset[];
  onChanged: () => void;
}

export function AssetManagement({ employeeId, assets, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [assetType, setAssetType] = useState("");
  const [assetName, setAssetName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [assignedDate, setAssignedDate] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [returningId, setReturningId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setAssetType("");
    setAssetName("");
    setSerialNumber("");
    setAssignedDate(new Date().toISOString().slice(0, 10));
    setNotes("");
    setError(null);
  };

  const assign = async () => {
    if (!assetType.trim() || !assetName.trim()) {
      setError("Asset type and asset name are required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await assetService.assign({
        employee_id: employeeId,
        asset_type: assetType.trim(),
        asset_name: assetName.trim(),
        serial_number: serialNumber.trim() || undefined,
        assigned_date: assignedDate || undefined,
        notes: notes.trim() || undefined,
      });

      reset();
      setOpen(false);
      onChanged();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Could not assign the asset. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const markReturned = async (assetId: string) => {
    setReturningId(assetId);
    setError(null);

    try {
      await assetService.markReturned(
        assetId,
        new Date().toISOString().slice(0, 10)
      );
      onChanged();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          "Could not mark the asset as returned."
      );
    } finally {
      setReturningId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">Assigned Assets</h3>
          <p className="text-xs text-ink-faint">
            Track company assets issued to this employee.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(true);
          }}
          className="rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
        >
          + Assign Asset
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {assets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-sm font-medium text-gray-500">
            No assets assigned
          </p>
          <p className="mt-1 text-xs text-gray-400">
            Assign a laptop, phone, monitor, ID card, or other company asset.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {assets.map((asset) => {
            const assetRecord = asset as Asset & Record<string, unknown>;

            const returnedDate =
              assetRecord.returned_date != null
                ? String(assetRecord.returned_date)
                : null;

            const status =
              assetRecord.status != null
                ? String(assetRecord.status)
                : returnedDate
                  ? "returned"
                  : "assigned";

            return (
              <div
                key={asset.id}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="grid flex-1 grid-cols-2 gap-4 md:grid-cols-4">
                    <div>
                      <p className="text-[11px] text-gray-400">Asset Type</p>
                      <p className="mt-1 text-sm font-medium">
                        {asset.asset_type || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-gray-400">Asset Name</p>
                      <p className="mt-1 text-sm font-medium">
                        {asset.asset_name || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-gray-400">
                        Serial Number
                      </p>
                      <p className="mt-1 text-sm font-medium">
                        {asset.serial_number || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-gray-400">Status</p>
                      <p className="mt-1 text-sm font-medium capitalize">
                        {status.replaceAll("_", " ")}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-gray-400">
                        Assigned Date
                      </p>
                      <p className="mt-1 text-sm">
                        {asset.assigned_date || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] text-gray-400">
                        Returned Date
                      </p>
                      <p className="mt-1 text-sm">
                        {returnedDate || "—"}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-[11px] text-gray-400">Notes</p>
                      <p className="mt-1 text-sm">
                        {asset.notes || "—"}
                      </p>
                    </div>
                  </div>

                  {!returnedDate && status !== "returned" && (
                    <button
                      type="button"
                      onClick={() => markReturned(asset.id)}
                      disabled={returningId === asset.id}
                      className="shrink-0 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {returningId === asset.id
                        ? "Returning..."
                        : "Mark Returned"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-ink">
                Assign Asset
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                Record a company asset issued to this employee.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="col-span-2">
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  Asset Type *
                </span>
                <input
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  placeholder="Laptop, Phone, Monitor..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </label>

              <label className="col-span-2">
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  Asset Name *
                </span>
                <input
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="MacBook Pro 14"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </label>

              <label>
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  Serial Number
                </span>
                <input
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="Serial number"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </label>

              <label>
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  Assigned Date
                </span>
                <input
                  type="date"
                  value={assignedDate}
                  onChange={(e) => setAssignedDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </label>

              <label className="col-span-2">
                <span className="mb-1 block text-xs font-medium text-gray-600">
                  Notes
                </span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Condition, accessories, remarks..."
                  className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand"
                />
              </label>
            </div>

            {error && (
              <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setOpen(false);
                }}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={assign}
                disabled={saving}
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Assigning..." : "Assign Asset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
