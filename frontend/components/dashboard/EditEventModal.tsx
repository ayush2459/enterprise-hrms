"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { eventService } from "@/services/event.service";
import type { CompanyEvent } from "@/types";

const CATEGORIES = [
  "Team Outing",
  "Holiday",
  "Induction",
  "Training",
  "Other",
];

export function EditEventModal({
  event,
  onClose,
  onUpdated,
}: {
  event: CompanyEvent;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [title, setTitle] = useState(event.title);
  const [eventDate, setEventDate] = useState(event.event_date);
  const [category, setCategory] = useState(event.category);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setTitle(event.title);
    setEventDate(event.event_date);
    setCategory(event.category);
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !eventDate) {
      setError("Title and date are required.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await eventService.update(event.id, {
        title: title.trim(),
        event_date: eventDate,
        category,
      });

      onUpdated();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ??
          "Could not update event."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-sm font-semibold text-brand-dark">
              Edit Company Event
            </h2>
            <p className="mt-0.5 text-[11px] text-gray-400">
              Update event details
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 px-6 py-5"
        >
          <Input
            id="edit_event_title"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            id="edit_event_date"
            label="Date"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-brand-dark">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
