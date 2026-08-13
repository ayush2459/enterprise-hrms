"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users,
  CalendarDays,
  Clock3,
  WalletCards,
  UserPlus,
  UserCheck,
  FileText,
  TrendingUp,
  ArrowRight,
  UserRoundCheck,
  BriefcaseBusiness,
  CircleCheck,
} from "lucide-react";

import { Topbar } from "@/components/layout/Topbar";
import { dashboardService } from "@/services/dashboard.service";
import { holidayService } from "@/services/holiday.service";
import type { DashboardSummary, Holiday } from "@/types";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [summary, holidayData] = await Promise.all([
        dashboardService.getSummary(),
        holidayService.listForYear(new Date().getFullYear()),
      ]);

      setData(summary);
      setHolidays(holidayData);
    } catch (err) {
      console.error("Dashboard loading failed:", err);
      setError("Unable to load live dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();

    // Refresh dashboard data periodically so the dashboard remains live.
    const interval = setInterval(loadDashboard, 30000);

    return () => clearInterval(interval);
  }, []);

  const totalEmployees = data?.total_employees ?? 0;
  const activeToday = data?.active_today ?? 0;
  const leavesToday = data?.leaves_today ?? 0;
  const pendingBGV = data?.pending_bgv ?? 0;
  const insurancePending = data?.insurance_pending ?? 0;
  const pendingDocs = data?.pending_document_verifications ?? 0;

  const attendancePercentage =
    totalEmployees > 0
      ? ((activeToday / totalEmployees) * 100).toFixed(1)
      : "0.0";

  const pendingApprovals =
    (data?.pending_approvals?.leave_requests ?? 0) +
    (data?.pending_approvals?.document_verifications ?? 0) +
    (data?.pending_approvals?.background_checks ?? 0) +
    (data?.pending_approvals?.dependent_verifications ?? 0);

  const today = new Date();
  const upcomingHolidays = holidays
    .filter((holiday) => new Date(holiday.date) >= today)
    .sort(
      (a, b) =>
        new Date(a.date).getTime() -
        new Date(b.date).getTime()
    )
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f6f8fc]">

      <Topbar
        title="Dashboard"
        subtitle="Your HR workspace at a glance"
      />

      <main className="w-full px-5 py-5 md:px-7 lg:px-8">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-[23px] font-bold tracking-tight text-slate-900">
              Good evening, Admin <span className="text-lg">👋</span>
            </h2>

            <p className="mt-1 text-[12px] text-slate-500">
              Live workforce data from your HRMS.
            </p>

            {data && (
              <p className="mt-1 text-[10px] font-medium text-emerald-600">
                ● Live · Automatically refreshed every 30 seconds
              </p>
            )}
          </div>

          <Link
            href="/employees"
            className="
              inline-flex w-fit items-center gap-2
              rounded-lg bg-blue-600
              px-4 py-2.5
              text-xs font-semibold text-white
              shadow-sm
              transition hover:bg-blue-700
            "
          >
            <UserPlus size={15} />
            Add Employee
          </Link>

        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
            {error}
          </div>
        )}

        {/* LIVE KPI CARDS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {[
            {
              label: "Total Employees",
              value: totalEmployees,
              note: `${data?.new_joiners_30d ?? 0} new joiners in 30 days`,
              icon: Users,
              iconClass: "bg-blue-50 text-blue-600",
            },
            {
              label: "Active Today",
              value: activeToday,
              note: `${attendancePercentage}% of employees`,
              icon: Clock3,
              iconClass: "bg-emerald-50 text-emerald-600",
            },
            {
              label: "On Leave Today",
              value: leavesToday,
              note: `${data?.pending_approvals?.leave_requests ?? 0} pending leave approvals`,
              icon: CalendarDays,
              iconClass: "bg-amber-50 text-amber-600",
            },
            {
              label: "Pending HR Actions",
              value: pendingApprovals,
              note: `${pendingDocs} docs · ${pendingBGV} BGV · ${insurancePending} insurance`,
              icon: CircleCheck,
              iconClass: "bg-violet-50 text-violet-600",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="
                  rounded-xl border border-slate-200
                  bg-white p-5
                  shadow-[0_2px_8px_rgba(15,23,42,0.035)]
                  transition duration-200
                  hover:-translate-y-0.5
                  hover:shadow-[0_8px_24px_rgba(15,23,42,0.07)]
                "
              >

                <div className="flex items-start justify-between">

                  <div
                    className={[
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      stat.iconClass,
                    ].join(" ")}
                  >
                    <Icon size={19} />
                  </div>

                  <span className="text-[10px] font-medium text-slate-400">
                    Live
                  </span>

                </div>

                <div className="mt-4 text-[27px] font-bold tracking-tight text-slate-900">
                  {loading ? "—" : stat.value}
                </div>

                <div className="mt-1 text-[12px] font-semibold text-slate-600">
                  {stat.label}
                </div>

                <div className="mt-2 text-[10px] font-semibold text-emerald-600">
                  {stat.note}
                </div>

              </div>
            );
          })}

        </div>

        {/* QUICK ACTIONS */}

        <section className="mt-6">

          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Quick Actions
            </h3>

            <p className="mt-0.5 text-[10px] text-slate-400">
              Frequently used HR operations
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

            {[
              {
                title: "Add Employee",
                description: "Create employee profile",
                href: "/employees",
                icon: UserPlus,
              },
              {
                title: "Recruitment",
                description: "Manage candidates",
                href: "/recruitment",
                icon: UserCheck,
              },
              {
                title: "Leave Requests",
                description: "Review pending leaves",
                href: "/leaves",
                icon: CalendarDays,
              },
              {
                title: "Payroll",
                description: "Manage salary & payroll",
                href: "/payroll",
                icon: WalletCards,
              },
            ].map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="
                    flex items-center justify-between
                    rounded-xl border border-slate-200
                    bg-white p-4
                    transition
                    hover:-translate-y-0.5
                    hover:border-blue-200
                    hover:shadow-md
                  "
                >
                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Icon size={17} />
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {action.title}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {action.description}
                      </p>
                    </div>

                  </div>

                  <ArrowRight size={15} className="text-slate-300" />
                </Link>
              );
            })}

          </div>
        </section>

        {/* WORKFORCE + HOLIDAYS */}

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.65fr_0.9fr]">

          {/* WORKFORCE */}

          <section className="rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.035)]">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Workforce Overview
                </h3>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Live employee distribution by department
                </p>
              </div>

              <TrendingUp size={17} className="text-blue-500" />

            </div>

            <div className="space-y-5 p-5">

              {data?.employees_by_department?.length ? (
                data.employees_by_department.map((department) => {

                  const percentage =
                    totalEmployees > 0
                      ? Math.round(
                          (department.count / totalEmployees) * 100
                        )
                      : 0;

                  return (
                    <div key={department.department}>

                      <div className="mb-2 flex items-center justify-between">

                        <div className="flex items-center gap-2">

                          <span className="h-2 w-2 rounded-full bg-blue-500" />

                          <span className="text-xs font-semibold text-slate-700">
                            {department.department}
                          </span>

                        </div>

                        <span className="text-[10px] font-medium text-slate-400">
                          {department.count} employees · {percentage}%
                        </span>

                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-700"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  {loading
                    ? "Loading workforce data..."
                    : "No workforce data available"}
                </div>
              )}

            </div>
          </section>

          {/* HOLIDAYS */}

          <section className="rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.035)]">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Upcoming Holidays
                </h3>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  {new Date().getFullYear()} company calendar
                </p>
              </div>

              <Link
                href="/leaves"
                className="text-[10px] font-semibold text-blue-600 hover:underline"
              >
                View all
              </Link>

            </div>

            <div>

              {upcomingHolidays.length ? (
                upcomingHolidays.map((holiday) => {

                  const date = new Date(holiday.date);

                  return (
                    <div
                      key={holiday.id}
                      className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0"
                    >

                      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                        <span className="text-xs font-bold">
                          {date.getDate()}
                        </span>

                        <span className="text-[8px] font-semibold uppercase">
                          {date.toLocaleString("en-IN", {
                            month: "short",
                          })}
                        </span>

                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-xs font-bold text-slate-700">
                          {holiday.name}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {holiday.is_optional
                            ? "Optional Holiday"
                            : "Public Holiday"}
                        </p>

                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="px-5 py-8 text-center text-xs text-slate-400">
                  {loading
                    ? "Loading holidays..."
                    : "No upcoming holidays"}
                </div>
              )}

            </div>
          </section>

        </div>

        {/* RECENT JOINERS + HR STATUS */}

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.4fr_1fr]">

          {/* RECENT JOINERS */}

          <section className="rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.035)]">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Recent Joiners
                </h3>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Employee records from the live directory
                </p>
              </div>

              <Link
                href="/employees"
                className="text-[10px] font-semibold text-blue-600 hover:underline"
              >
                View employees
              </Link>

            </div>

            <div className="divide-y divide-slate-100">

              {data?.recent_joiners?.length ? (
                data.recent_joiners.slice(0, 5).map((employee) => (

                  <Link
                    href={`/employees/${employee.id}`}
                    key={employee.id}
                    className="flex items-center justify-between px-5 py-4 transition hover:bg-slate-50"
                  >

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                        {employee.full_name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>

                      <div>

                        <p className="text-xs font-bold text-slate-800">
                          {employee.full_name}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {employee.designation}
                          {employee.department
                            ? ` · ${employee.department}`
                            : ""}
                        </p>

                      </div>

                    </div>

                    <span className="text-[10px] font-medium text-slate-400">
                      {employee.date_of_joining}
                    </span>

                  </Link>

                ))
              ) : (
                <div className="px-5 py-8 text-center text-xs text-slate-400">
                  {loading
                    ? "Loading employees..."
                    : "No recent joiners"}
                </div>
              )}

            </div>

          </section>

          {/* HR ACTION STATUS */}

          <section className="rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.035)]">

            <div className="border-b border-slate-100 px-5 py-4">

              <h3 className="text-sm font-bold text-slate-900">
                HR Operations Status
              </h3>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Live outstanding HR actions
              </p>

            </div>

            <div className="space-y-4 p-5">

              {[
                {
                  label: "Pending BGV",
                  value: pendingBGV,
                  href: "/background-check",
                },
                {
                  label: "Insurance Pending",
                  value: insurancePending,
                  href: "/insurance",
                },
                {
                  label: "Document Verification",
                  value: pendingDocs,
                  href: "/documents",
                },
                {
                  label: "Pending Leave Approvals",
                  value: data?.pending_approvals?.leave_requests ?? 0,
                  href: "/leaves",
                },
                {
                  label: "Dependent Verification",
                  value:
                    data?.pending_approvals?.dependent_verifications ?? 0,
                  href: "/insurance",
                },
              ].map((item) => (

                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-3 transition hover:border-blue-200 hover:bg-blue-50/30"
                >

                  <div className="flex items-center gap-2">

                    <CircleCheck
                      size={15}
                      className={
                        item.value > 0
                          ? "text-amber-500"
                          : "text-emerald-500"
                      }
                    />

                    <span className="text-xs font-semibold text-slate-700">
                      {item.label}
                    </span>

                  </div>

                  <span
                    className={[
                      "rounded-full px-2.5 py-1 text-[10px] font-bold",
                      item.value > 0
                        ? "bg-amber-50 text-amber-600"
                        : "bg-emerald-50 text-emerald-600",
                    ].join(" ")}
                  >
                    {item.value}
                  </span>

                </Link>

              ))}

            </div>

          </section>

        </div>

        {/* SEPARATED EMPLOYEES */}

        {data?.recently_separated?.length ? (
          <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.035)]">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Recently Separated
                </h3>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Latest employee separation records
                </p>
              </div>

              <Link
                href="/employees/former"
                className="text-[10px] font-semibold text-blue-600 hover:underline"
              >
                View former employees
              </Link>

            </div>

            <div className="grid grid-cols-1 divide-y divide-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0">

              {data.recently_separated.slice(0, 4).map((employee) => (

                <div
                  key={`${employee.id}-${employee.separation_date}`}
                  className="flex items-center justify-between px-5 py-4"
                >

                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {employee.full_name}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {employee.designation}
                    </p>
                  </div>

                  <div className="text-right">

                    <p className="text-[10px] font-semibold text-red-500">
                      {employee.status}
                    </p>

                    <p className="mt-0.5 text-[9px] text-slate-400">
                      {employee.separation_date}
                    </p>

                  </div>

                </div>

              ))}

            </div>

          </section>
        ) : null}

      </main>
    </div>
  );
}

