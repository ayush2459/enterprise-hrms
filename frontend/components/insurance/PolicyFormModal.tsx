"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { insuranceService } from "@/services/insurance.service";
import type { InsurancePolicy } from "@/types";

const ALL_BENEFITS = ["Hospitalization", "OPD", "Maternity", "Dental", "Vision", "Critical Illness"];

export function PolicyFormModal({
  employeeId,
  existing,
  onClose,
  onSaved,
}: {
  employeeId: string;
  existing: InsurancePolicy | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [policyNumber, setPolicyNumber] = useState(existing?.policy_number ?? "");
  const [insurerName, setInsurerName] = useState(existing?.insurer_name ?? "");
  const [planType, setPlanType] = useState(existing?.plan_type ?? "");
  const [sumInsured, setSumInsured] = useState(String(existing?.sum_insured ?? ""));
  const [premiumEmployer, setPremiumEmployer] = useState(String(existing?.premium_employer_paid ?? "0"));
  const [premiumEmployee, setPremiumEmployee] = useState(String(existing?.premium_employee_contribution ?? "0"));
  const [validFrom, setValidFrom] = useState(existing?.valid_from ?? "");
  const [validTo, setValidTo] = useState(existing?.valid_to ?? "");
  const [benefits, setBenefits] = useState<string[]>(existing?.benefits ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleBenefit = (b: string) => {
    setBenefits((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await insuranceService.upsertPolicy(employeeId, {
        policy_number: policyNumber,
        insurer_name: insurerName,
        plan_type: planType,
        sum_insured: parseInt(sumInsured, 10) || 0,
        premium_employer_paid: parseInt(premiumEmployer, 10) || 0,
        premium_employee_contribution: parseInt(premiumEmployee, 10) || 0,
        valid_from: validFrom,
        valid_to: validTo,
        benefits,
      });
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Could not save policy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-brand-dark">
            {existing ? "Edit Policy" : "Add Policy"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <Input id="policy_number" label="Policy Number" value={policyNumber} onChange={(e) => setPolicyNumber(e.target.value)} required />
          <Input id="insurer_name" label="Insurer / TPA Name" value={insurerName} onChange={(e) => setInsurerName(e.target.value)} required />
          <Input id="plan_type" label="Plan Type" placeholder="e.g. Family Floater" value={planType} onChange={(e) => setPlanType(e.target.value)} required />
          <Input id="sum_insured" label="Sum Insured" type="number" value={sumInsured} onChange={(e) => setSumInsured(e.target.value)} required />
          <div className="grid grid-cols-2 gap-3">
            <Input id="premium_employer" label="Employer-Paid Premium" type="number" value={premiumEmployer} onChange={(e) => setPremiumEmployer(e.target.value)} />
            <Input id="premium_employee" label="Employee Contribution" type="number" value={premiumEmployee} onChange={(e) => setPremiumEmployee(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input id="valid_from" label="Valid From" type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} required />
            <Input id="valid_to" label="Valid To" type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark">Coverage / Benefits</label>
            <div className="flex flex-wrap gap-2">
              {ALL_BENEFITS.map((b) => (
                <button
                  type="button"
                  key={b}
                  onClick={() => toggleBenefit(b)}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    benefits.includes(b)
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : "Save Policy"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
