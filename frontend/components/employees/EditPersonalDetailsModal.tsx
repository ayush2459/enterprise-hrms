"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { employeeService } from "@/services/employee.service";
import type { EmployeeFull } from "@/types";

export function EditPersonalDetailsModal({
  employeeId,
  existing,
  onClose,
  onSaved,
}: {
  employeeId: string;
  existing: EmployeeFull;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [dateOfBirth, setDateOfBirth] = useState(existing.date_of_birth ?? "");
  const [gender, setGender] = useState(existing.gender ?? "");
  const [bloodGroup, setBloodGroup] = useState(existing.blood_group ?? "");
  const [personalEmail, setPersonalEmail] = useState(existing.personal_email ?? "");
  const [emergencyContact, setEmergencyContact] = useState(existing.emergency_contact ?? "");
  const [address, setAddress] = useState(existing.personal_address ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await employeeService.update(employeeId, {
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        blood_group: bloodGroup || null,
        personal_email: personalEmail || null,
        emergency_contact: emergencyContact || null,
        personal_address: address || null,
      } as any);
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Could not save personal details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-brand-dark">Edit Personal Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="date_of_birth"
              label="Date of Birth"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-brand-dark">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>
          <Input
            id="blood_group"
            label="Blood Group"
            placeholder="e.g. O+"
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
          />
          <Input
            id="personal_email"
            label="Personal Email"
            type="email"
            value={personalEmail}
            onChange={(e) => setPersonalEmail(e.target.value)}
          />
          <Input
            id="emergency_contact"
            label="Emergency Contact"
            placeholder="Name and phone number"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
          />
          <Input
            id="address"
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
