"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, FileText, IndianRupee, UserRound, WalletCards } from "lucide-react";

import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/common/Loader";
import { ApplyLeaveModal } from "@/components/leaves/ApplyLeaveModal";
import { employeeService } from "@/services/employee.service";
import { leaveService } from "@/services/leave.service";
import { attendanceService } from "@/services/attendance.service";
import { payrollService } from "@/services/payroll.service";
import type { AttendanceSummary, EmployeeFull, EmployeePublic, LeaveBalance, LeaveRequest, LeaveType, PayrollRecord } from "@/types";

const statusClass: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-700",
};

export default function MyWorkspacePage() {
  const [employee, setEmployee] = useState<EmployeeFull | null>(null);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await employeeService.me();
      setEmployee(me);
      const [leaveBalance, leaveRequests, attendanceSummary, payrollRecords, types] = await Promise.all([
        leaveService.getBalance(me.id),
        leaveService.listForEmployee(me.id),
        attendanceService.getSummary(me.id),
        payrollService.listForEmployee(me.id),
        leaveService.listTypes(),
      ]);
      setBalances(leaveBalance);
      setRequests(leaveRequests);
      setAttendance(attendanceSummary);
      setPayroll(payrollRecords);
      setLeaveTypes(types);
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "We couldn't load your employee workspace.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const recentRequests = useMemo(() => [...requests].reverse().slice(0, 5), [requests]);
  const latestPayroll = payroll[0];

  if (loading) {
    return <><Topbar title="My Workspace" subtitle="Your employee self-service portal" /><div className="p-8"><Loader label="Loading your workspace..." /></div></>;
  }

  if (error || !employee) {
    return <><Topbar title="My Workspace" subtitle="Your employee self-service portal" /><div className="p-8"><Card className="border-red-100 bg-red-50"><p className="text-sm font-semibold text-red-700">Workspace unavailable</p><p className="mt-1 text-xs text-red-600">{error ?? "No employee profile is linked to this account."}</p></Card></div></>;
  }

  const fullEmployee = employee;

  return (
    <>
      <Topbar title="My Workspace" subtitle={`Welcome back, ${employee.full_name}`} />
      <div className="space-y-6 p-5 md:p-8">
        <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-[#172554] to-[#2563eb] p-6 text-white shadow-soft">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-medium text-blue-100">EMPLOYEE SELF-SERVICE</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight">{employee.full_name}</h1>
              <p className="mt-1 text-sm text-blue-100">{employee.designation ?? "Employee"}{employee.department ? ` · ${employee.department}` : ""}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <span className="rounded-full bg-white/10 px-3 py-1.5">{employee.employee_id ?? "Employee"}</span>
                <span className="rounded-full bg-white/10 px-3 py-1.5 capitalize">{employee.employment_type.replaceAll("_", " ")}</span>
                <span className="rounded-full bg-emerald-400/20 px-3 py-1.5 text-emerald-100">{employee.status.replaceAll("_", " ")}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowLeaveModal(true)} className="bg-white text-blue-700 hover:bg-blue-50"><span className="flex items-center gap-2"><CalendarDays size={16} />Apply for Leave</span></Button>
              <Link href="/settings"><Button variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/15"><span className="flex items-center gap-2"><UserRound size={16} />Account</span></Button></Link>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={CalendarDays} label="Leave balance" value={`${balances.reduce((sum, item) => sum + item.days_remaining, 0)} days`} helper={`${balances.length} active leave policies`} />
          <MetricCard icon={Clock3} label="Attendance" value={attendance ? `${attendance.present} present` : "—"} helper={attendance ? `${attendance.on_leave} leave · ${attendance.absent} absent` : "No data"} />
          <MetricCard icon={WalletCards} label="Latest net pay" value={latestPayroll ? formatCurrency(latestPayroll.net_pay) : "—"} helper={latestPayroll ? formatMonth(latestPayroll.month) : "No payroll record"} />
          <MetricCard icon={CheckCircle2} label="Leave requests" value={`${requests.filter((item) => item.status === "pending").length} pending`} helper={`${requests.length} total requests`} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div><h2 className="text-sm font-bold text-slate-900">Leave balances</h2><p className="mt-1 text-[11px] text-slate-400">Your current available days by policy.</p></div>
              <Button onClick={() => setShowLeaveModal(true)} variant="ghost" className="text-xs">Request leave <ArrowRight size={14} className="ml-1 inline" /></Button>
            </div>
            <div className="divide-y divide-slate-100">
              {balances.map((balance) => <div key={balance.leave_type_id} className="flex items-center justify-between px-5 py-4"><div><p className="text-sm font-semibold text-slate-800">{balance.leave_type_name}</p><p className="mt-1 text-[11px] text-slate-400">{balance.days_used} used of {balance.annual_quota_days} days</p></div><div className="text-right"><p className="text-lg font-bold text-slate-900">{balance.days_remaining}</p><p className="text-[10px] text-slate-400">remaining</p></div></div>)}
              {balances.length === 0 && <div className="px-5 py-8 text-center text-xs text-slate-400">No leave policies assigned.</div>}
            </div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-bold text-slate-900">My leave requests</h2><p className="mt-1 text-[11px] text-slate-400">Track requests and approval status.</p></div>
            <div className="divide-y divide-slate-100">
              {recentRequests.map((request) => <div key={request.id} className="flex items-center justify-between gap-4 px-5 py-3.5"><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-800">{leaveTypes.find((type) => type.id === request.leave_type_id)?.name ?? "Leave"}</p><p className="mt-1 text-[10px] text-slate-400">{formatDate(request.start_date)} – {formatDate(request.end_date)}</p></div><span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${statusClass[request.status] ?? "bg-slate-50 text-slate-600"}`}>{request.status}</span></div>)}
              {recentRequests.length === 0 && <div className="px-5 py-8 text-center text-xs text-slate-400">No leave requests yet.</div>}
            </div>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-[.9fr_1.1fr]">
          <Card>
            <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><UserRound size={19} /></div><div><h2 className="text-sm font-bold text-slate-900">My profile</h2><p className="text-[11px] text-slate-400">Personal information and contact details.</p></div></div>
            <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4">
              <ProfileItem label="Official email" value={fullEmployee.official_email ?? "—"} />
              <ProfileItem label="Personal email" value={fullEmployee.personal_email ?? "—"} />
              <ProfileItem label="Mobile" value={fullEmployee.mobile_number ?? "—"} />
              <ProfileItem label="Joining date" value={employee.date_of_joining ? formatDate(employee.date_of_joining) : "—"} />
              <ProfileItem label="Bank" value={fullEmployee.bank_name ?? "—"} />
              <ProfileItem label="IFSC" value={fullEmployee.bank_ifsc ?? "—"} />
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4"><Link href="/settings" className="text-xs font-semibold text-blue-600 hover:underline">Update account settings →</Link></div>
          </Card>

          <Card className="overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="text-sm font-bold text-slate-900">Payslips & payroll</h2><p className="mt-1 text-[11px] text-slate-400">Your payroll records, visible only to you and HR.</p></div><IndianRupee size={18} className="text-slate-300" /></div>
            <div className="divide-y divide-slate-100">
              {payroll.slice(0, 5).map((record) => <div key={record.id} className="flex items-center justify-between px-5 py-3.5"><div><p className="text-xs font-semibold text-slate-800">{formatMonth(record.month)}</p><p className="mt-1 capitalize text-[10px] text-slate-400">{record.status}</p></div><p className="text-sm font-bold text-slate-900">{formatCurrency(record.net_pay)}</p></div>)}
              {payroll.length === 0 && <div className="px-5 py-8 text-center text-xs text-slate-400">No payroll records available.</div>}
            </div>
          </Card>
        </div>

        <Card className="border-blue-100 bg-blue-50/50">
          <div className="flex items-start gap-3"><FileText size={18} className="mt-0.5 text-blue-600" /><div><p className="text-sm font-semibold text-slate-900">Self-service foundation is now live</p><p className="mt-1 text-xs leading-relaxed text-slate-500">This workspace is connected to the existing employee, leave, attendance and payroll APIs. Leave applications are validated by the same server-side policies used by HR.</p></div></div>
        </Card>
      </div>

      {showLeaveModal && <ApplyLeaveModal employeeId={employee.id} employeeGender={employee.gender} leaveTypes={leaveTypes} balances={balances} onClose={() => setShowLeaveModal(false)} onApplied={load} />}
    </>
  );
}

function MetricCard({ icon: Icon, label, value, helper }: { icon: typeof CalendarDays; label: string; value: string; helper: string }) {
  return <Card className="p-4"><div className="flex items-start justify-between"><div><p className="text-[11px] font-medium text-slate-400">{label}</p><p className="mt-2 text-xl font-bold tracking-tight text-slate-900">{value}</p><p className="mt-1 text-[10px] text-slate-400">{helper}</p></div><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500"><Icon size={17} /></div></div></Card>;
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return <div><p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 truncate text-xs font-medium text-slate-700">{value}</p></div>;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatMonth(value: string) {
  return new Date(value).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}
