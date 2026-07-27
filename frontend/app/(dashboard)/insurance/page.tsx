"use client";

import { useEffect, useState } from "react";
import { Plus, Edit2, CheckCircle2 } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { PolicyFormModal } from "@/components/insurance/PolicyFormModal";
import { AddDependentModal } from "@/components/insurance/AddDependentModal";
import { DigitalCard } from "@/components/insurance/DigitalCard";
import { employeeService } from "@/services/employee.service";
import { insuranceService } from "@/services/insurance.service";
import { useAuthStore } from "@/store/auth.store";
import type { EmployeePublic, InsuranceFull } from "@/types";

const HR_ROLES = ["hr_admin", "hr_executive", "system_admin"];

export default function InsurancePage() {
  const { user } = useAuthStore();
  const isHR = !!user && HR_ROLES.includes(user.role);

  const [employees, setEmployees] = useState<EmployeePublic[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [data, setData] = useState<InsuranceFull | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showDependentModal, setShowDependentModal] = useState(false);

  useEffect(() => {
    employeeService.list(0, 100).then((list) => {
      setEmployees(list);
      if (list.length > 0) setSelectedEmployeeId(list[0].id);
    });
  }, []);

  const loadInsurance = (employeeId: string) => {
    setLoading(true);
    setError(null);
    insuranceService
      .getForEmployee(employeeId)
      .then(setData)
      .catch((err) => {
        if (err?.response?.status === 403) {
          setError("You don't have access to view insurance details for this employee.");
        } else {
          setError("Could not load insurance details.");
        }
        setData(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedEmployeeId) loadInsurance(selectedEmployeeId);
  }, [selectedEmployeeId]);

  const handleVerifyDependent = async (dependentId: string) => {
    try {
      await insuranceService.verifyDependent(dependentId);
      loadInsurance(selectedEmployeeId);
    } catch {
      setError("Could not verify dependent.");
    }
  };

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  return (
    <>
      <Topbar title="Insurance" subtitle="Health coverage & digital cards" />
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-500">Employee</label>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {loading ? (
          <Loader label="Loading insurance details..." />
        ) : data ? (
          <>
            {data.policy ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-brand-dark">Digital Insurance Cards</h2>
                  {isHR && (
                    <Button
                      variant="secondary"
                      onClick={() => setShowPolicyModal(true)}
                      className="flex items-center gap-2 text-xs px-3 py-1.5"
                    >
                      <Edit2 size={14} />
                      Edit Policy
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {selectedEmployee && (
                    <DigitalCard
                      policy={data.policy}
                      holderName={selectedEmployee.full_name}
                      cardId={`${data.policy.policy_number}-E`}
                    />
                  )}
                  {data.dependents
                    .filter((d) => d.verified)
                    .map((dep) => (
                      <DigitalCard
                        key={dep.id}
                        policy={data.policy!}
                        holderName={dep.full_name}
                        cardId={dep.card_id}
                        relationship={dep.relationship}
                      />
                    ))}
                </div>

                <Card>
                  <h2 className="mb-3 text-sm font-semibold text-brand-dark">Coverage Breakdown</h2>
                  <div className="flex flex-wrap gap-2">
                    {data.policy.benefits.map((b) => (
                      <span
                        key={b}
                        className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-brand-dark"
                      >
                        {b}
                      </span>
                    ))}
                    {data.policy.benefits.length === 0 && (
                      <span className="text-xs text-gray-400">No benefits listed.</span>
                    )}
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                    <div>
                      <p className="text-xs text-gray-500">Plan Type</p>
                      <p className="font-medium text-brand-dark">{data.policy.plan_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Employer-Paid Premium</p>
                      <p className="font-medium text-brand-dark">
                        ₹{data.policy.premium_employer_paid.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Your Contribution</p>
                      <p className="font-medium text-brand-dark">
                        ₹{data.policy.premium_employee_contribution.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Valid Through</p>
                      <p className="font-medium text-brand-dark">
                        {new Date(data.policy.valid_to).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-0 overflow-hidden">
                  <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
                    <h2 className="text-sm font-semibold text-brand-dark">Covered Family Members</h2>
                    <Button
                      onClick={() => setShowDependentModal(true)}
                      className="flex items-center gap-2 text-xs px-3 py-1.5"
                    >
                      <Plus size={14} />
                      Add Family Member
                    </Button>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-surface-muted text-left text-gray-500">
                      <tr>
                        <th className="px-5 py-3 font-medium">Name</th>
                        <th className="px-5 py-3 font-medium">Relationship</th>
                        <th className="px-5 py-3 font-medium">Date of Birth</th>
                        <th className="px-5 py-3 font-medium">Card ID</th>
                        <th className="px-5 py-3 font-medium text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {data.dependents.map((dep) => (
                        <tr key={dep.id}>
                          <td className="px-5 py-3 font-medium text-brand-dark">{dep.full_name}</td>
                          <td className="px-5 py-3 text-gray-600 capitalize">{dep.relationship}</td>
                          <td className="px-5 py-3 text-gray-600">
                            {new Date(dep.date_of_birth).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3 text-gray-600">{dep.card_id}</td>
                          <td className="px-5 py-3 text-right">
                            {dep.verified ? (
                              <span className="flex items-center justify-end gap-1 text-xs font-medium text-green-700">
                                <CheckCircle2 size={14} />
                                Verified
                              </span>
                            ) : isHR ? (
                              <button
                                onClick={() => handleVerifyDependent(dep.id)}
                                className="text-xs font-medium text-brand hover:underline"
                              >
                                Verify
                              </button>
                            ) : (
                              <span className="text-xs text-amber-600">Pending</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {data.dependents.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                            No family members added yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </Card>
              </>
            ) : (
              <Card className="py-16 text-center text-gray-400">
                <p className="mb-4">No insurance policy on file for this employee.</p>
                {isHR && <Button onClick={() => setShowPolicyModal(true)}>Add Policy</Button>}
              </Card>
            )}
          </>
        ) : null}
      </div>

      {showPolicyModal && selectedEmployeeId && (
        <PolicyFormModal
          employeeId={selectedEmployeeId}
          existing={data?.policy ?? null}
          onClose={() => setShowPolicyModal(false)}
          onSaved={() => loadInsurance(selectedEmployeeId)}
        />
      )}
      {showDependentModal && selectedEmployeeId && (
        <AddDependentModal
          employeeId={selectedEmployeeId}
          onClose={() => setShowDependentModal(false)}
          onAdded={() => loadInsurance(selectedEmployeeId)}
        />
      )}
    </>
  );
}
