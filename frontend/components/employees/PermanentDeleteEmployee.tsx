"use client";

import { useState } from "react";
import { Trash2, X } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

type Props = {
  employeeId: string;
  isHR: boolean;
};

export default function PermanentDeleteEmployee({
  employeeId,
  isHR,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isHR) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/employees/${employeeId}`);

      // Immediately synchronize every open HR employee directory.
      try {
        const payload = {
          type: "employee_deleted",
          employeeId,
        };

        window.dispatchEvent(
          new CustomEvent("hrhub:employee_deleted", {
            detail: payload,
          })
        );

        if (typeof BroadcastChannel !== "undefined") {
          const channel = new BroadcastChannel("hrhub-employees");
          channel.postMessage(payload);
          channel.close();
        }
      } catch {
        // Synchronization is supplemental; deletion already succeeded.
      }


      window.dispatchEvent(
        new CustomEvent("hrhub:realtime", {
          detail: {
            type: "employee_deleted",
            employee_id: employeeId,
          },
        })
      );

      window.location.href = "/employees";
    } catch (err: any) {
      const detail = err?.response?.data?.detail;

      if (typeof detail === "string") {
        setError(detail);
      } else if (Array.isArray(detail)) {
        setError(
          detail
            .map((item: any) =>
              typeof item === "string"
                ? item
                : item?.msg
                  ? String(item.msg)
                  : ""
            )
            .filter(Boolean)
            .join(", ") || "Could not delete employee."
        );
      } else {
        setError("Could not delete employee.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
        className="bg-red-600 text-white shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Employee
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Permanently Delete Employee?
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  This permanently removes the employee and associated
                  records from the system. This action cannot be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>

              <Button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 text-white shadow-sm transition-all duration-200 hover:bg-red-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {loading ? "Deleting..." : "Delete Permanently"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
