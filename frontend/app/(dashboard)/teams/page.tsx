"use client";

import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { AddEmployeeModal } from "@/components/employees/AddEmployeeModal";
import { employeeService } from "@/services/employee.service";
import { teamService } from "@/services/team.service";
import type { EmployeePublic, OrgSnippet, TeamMember, TeamStatusRow } from "@/types";
import { usePageSearch } from "@/components/layout/PageSearchContext";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  on_leave: "bg-amber-50 text-amber-700",
  offboarded: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  active: "Active",
  on_leave: "On Leave",
  offboarded: "Offboarded",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

/**
 * A node above "you" in the chain — the direct manager or a skip-level manager.
 * `level="skip"` renders a darker shade so multi-level chains read top-to-bottom.
 */
function ManagerNode({ member, level = "direct" }: { member: TeamMember; level?: "direct" | "skip" }) {
  return (
    <div
      className={`flex w-full max-w-xs items-center gap-3 rounded-2xl p-4 shadow-soft ${
        level === "skip" ? "bg-brand-dark" : "bg-brand"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold ${
          level === "skip" ? "text-brand-dark" : "text-brand"
        }`}
      >
        {getInitials(member.full_name)}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-white">{member.full_name}</p>
        <p className="truncate text-xs text-white/80">{member.designation ?? "—"}</p>
      </div>
    </div>
  );
}

/** Middle node: the selected employee themself, highlighted with a brand border. */
function SelfNode({ member }: { member: TeamMember }) {
  return (
    <div className="flex w-full max-w-xs items-center gap-3 rounded-2xl border-2 border-brand bg-white p-4 shadow-soft">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand">
        {getInitials(member.full_name)}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-brand-dark">{member.full_name} (You)</p>
        <p className="truncate text-xs text-gray-500">{member.designation ?? "—"}</p>
      </div>
    </div>
  );
}

/** Leaf node: a direct report, plain card with a status pill. */
function ReportNode({ member }: { member: TeamMember }) {
  return (
    <div className="flex w-full items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-soft">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
        {getInitials(member.full_name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-brand-dark">{member.full_name}</p>
        <p className="truncate text-xs text-gray-500">{member.designation ?? "—"}</p>
      </div>
      <StatusBadge status={member.status} />
    </div>
  );
}

/** Roster row shown in the side panel. */
function RosterRow({ member }: { member: TeamMember }) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
        {getInitials(member.full_name)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brand-dark">{member.full_name}</p>
        <p className="truncate text-xs text-gray-500">{member.designation ?? "—"}</p>
      </div>
      <StatusBadge status={member.status} />
    </div>
  );
}

/** Renders the horizontal + vertical connector lines above a row of sibling nodes. */
function SiblingConnectors({ count }: { count: number }) {
  if (count <= 1) {
    return <div className="mx-auto h-6 w-px bg-gray-200" />;
  }
  return (
    <div className="flex">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-1 flex-col items-center">
          <div
            className="h-px bg-gray-200"
            style={{
              width: i === 0 || i === count - 1 ? "50%" : "100%",
              marginLeft: i === 0 ? "50%" : 0,
              marginRight: i === count - 1 ? "50%" : 0,
            }}
          />
          <div className="h-6 w-px bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export default function TeamsPage() {
  const { query: pageSearchQuery } = usePageSearch();
  const [employees, setEmployees] = useState<EmployeePublic[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [org, setOrg] = useState<OrgSnippet | null>(null);
  const [skipLevelManager, setSkipLevelManager] = useState<TeamMember | null>(null);
  const [statusRows, setStatusRows] = useState<TeamStatusRow[] | null>(null);
  const [canViewStatus, setCanViewStatus] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [managerSelection, setManagerSelection] = useState<string>("");
  const [savingManager, setSavingManager] = useState(false);

  const loadEmployees = () => {
    employeeService.list(0, 100).then((list) => {
      setEmployees(list);
      if (list.length > 0 && !selectedEmployeeId) setSelectedEmployeeId(list[0].id);
    });
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadOrgData = () => {
    if (!selectedEmployeeId) return;
    setLoading(true);
    setError(null);
    setStatusRows(null);
    setCanViewStatus(true);

    setSkipLevelManager(null);

    teamService
      .getOrgSnippet(selectedEmployeeId)
      .then((data) => {
        setOrg(data);
        setManagerSelection(data.manager?.id ?? "");

        if (data.manager) {
          teamService
            .getOrgSnippet(data.manager.id)
            .then((managerOrg) => setSkipLevelManager(managerOrg.manager))
            .catch(() => setSkipLevelManager(null));
        }
      })
      .catch(() => setError("Could not load team data."))
      .finally(() => setLoading(false));

    teamService
      .getStatusSummary(selectedEmployeeId)
      .then(setStatusRows)
      .catch((err) => {
        if (err?.response?.status === 403) {
          setCanViewStatus(false);
        }
      });
  };

  useEffect(() => {
    loadOrgData();
  }, [selectedEmployeeId]);

  const handleAssignManager = async () => {
    setSavingManager(true);
    setError(null);
    try {
      await employeeService.update(selectedEmployeeId, {
        reporting_manager_id: managerSelection || null,
      } as any);
      loadOrgData();
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Could not update reporting manager.");
    } finally {
      setSavingManager(false);
    }
  };

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);

  const searchFilteredEmployees = employees.filter((e) => {
    const q = pageSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return [e.full_name, e.department, e.designation, e.status]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(q);
  });

  const selfMember: TeamMember | null = selectedEmployee
    ? {
        id: selectedEmployee.id,
        full_name: selectedEmployee.full_name,
        designation: selectedEmployee.designation,
        department: selectedEmployee.department,
        official_email: "",
        status: selectedEmployee.status,
        employment_type: selectedEmployee.employment_type,
      }
    : null;

  const rosterMembers: TeamMember[] = [
    ...(skipLevelManager ? [skipLevelManager] : []),
    ...(org?.manager ? [org.manager] : []),
    ...(selfMember ? [selfMember] : []),
    ...(org?.direct_reports ?? []),
  ];

  return (
    <>
      <Topbar title="My Team" subtitle="Reporting line and direct reports" />
      <div className="p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">Employee</label>
            <select
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
              className="rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
            >
              {searchFilteredEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name}
                </option>
              ))}
            </select>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <UserPlus size={16} />
            Add Employee
          </Button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {employees.length === 0 ? (
          <Card className="py-16 text-center text-gray-400">
            No employees yet. Click &quot;Add Employee&quot; to create the first one.
          </Card>
        ) : loading ? (
          <Loader label="Loading team..." />
        ) : org && selfMember ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
            {/* Org chart */}
            <Card>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-brand-dark">Reporting Line</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={managerSelection}
                    onChange={(e) => setManagerSelection(e.target.value)}
                    className="rounded-md border border-gray-200 px-2 py-1.5 text-xs outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                  >
                    <option value="">No manager</option>
                    {employees
                      .filter((e) => e.id !== selectedEmployeeId)
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.full_name}
                        </option>
                      ))}
                  </select>
                  <Button
                    onClick={handleAssignManager}
                    disabled={savingManager || managerSelection === (org.manager?.id ?? "")}
                    className="text-xs px-3 py-1.5"
                  >
                    {savingManager ? "Saving..." : "Set Manager"}
                  </Button>
                </div>
              </div>

              <div className="flex flex-col items-center">
                {skipLevelManager && (
                  <>
                    <ManagerNode member={skipLevelManager} level="skip" />
                    <div className="h-6 w-px bg-gray-200" />
                  </>
                )}

                {org.manager ? (
                  <>
                    <ManagerNode member={org.manager} level="direct" />
                    <div className="h-6 w-px bg-gray-200" />
                  </>
                ) : (
                  <p className="mb-4 text-xs text-gray-400">No reporting manager set.</p>
                )}

                <SelfNode member={selfMember} />

                {org.direct_reports.length > 0 && (
                  <div className="w-full max-w-3xl">
                    <SiblingConnectors count={org.direct_reports.length} />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {org.direct_reports.map((report) => (
                        <ReportNode key={report.id} member={report} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Team roster */}
            <Card className="h-fit">
              <h2 className="mb-1 text-sm font-semibold text-brand-dark">Team Roster</h2>
              <div className="divide-y divide-gray-100">
                {rosterMembers.map((member) => (
                  <RosterRow key={member.id} member={member} />
                ))}
              </div>
            </Card>
          </div>
        ) : null}

        {canViewStatus && statusRows !== null && (
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-gray-100 px-5 py-3">
              <h2 className="text-sm font-semibold text-brand-dark">Team Status Summary</h2>
              <p className="text-xs text-gray-500">
                Completion counts only — no sensitive field values are shown here.
              </p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-surface-muted text-left text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Team Member</th>
                  <th className="px-5 py-3 font-medium">Documents Verified</th>
                  <th className="px-5 py-3 font-medium">BGV Cleared</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {statusRows.map((row) => (
                  <tr key={row.employee_id}>
                    <td className="px-5 py-3 font-medium text-brand-dark">{row.full_name}</td>
                    <td className="px-5 py-3 text-gray-600">
                      {row.documents_verified} / {row.documents_total}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {row.bgv_cleared} / {row.bgv_total}
                    </td>
                  </tr>
                ))}
                {statusRows.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-gray-400">
                      This employee has no direct reports.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onCreated={loadEmployees}
        />
      )}
    </>
  );
}
