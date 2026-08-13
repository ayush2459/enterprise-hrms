"use client";

import Link from "next/link";
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

const stats = [
  {
    label: "Total Employees",
    value: "124",
    note: "+8.4% this month",
    icon: Users,
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    label: "Present Today",
    value: "112",
    note: "90.3% attendance",
    icon: Clock3,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "On Leave",
    value: "8",
    note: "2 pending approvals",
    icon: CalendarDays,
    iconClass: "bg-amber-50 text-amber-600",
  },
  {
    label: "Payroll",
    value: "₹9.4L",
    note: "August processed",
    icon: WalletCards,
    iconClass: "bg-violet-50 text-violet-600",
  },
];

const quickActions = [
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
];

const departments = [
  { name: "Engineering", employees: 48, percentage: 39 },
  { name: "Human Resources", employees: 22, percentage: 18 },
  { name: "Finance", employees: 18, percentage: 15 },
  { name: "Operations", employees: 21, percentage: 17 },
  { name: "Sales", employees: 15, percentage: 12 },
];

const holidays = [
  {
    day: "15",
    month: "AUG",
    name: "Independence Day",
    type: "Public Holiday",
  },
  {
    day: "02",
    month: "OCT",
    name: "Gandhi Jayanti",
    type: "Public Holiday",
  },
  {
    day: "08",
    month: "NOV",
    name: "Diwali",
    type: "Festival Holiday",
  },
  {
    day: "25",
    month: "DEC",
    name: "Christmas",
    type: "Public Holiday",
  },
];

const recentEmployees = [
  {
    name: "Ayush Gupta",
    designation: "Manager",
    department: "Tech",
    status: "Active",
  },
  {
    name: "Priya Mehta",
    designation: "HR Manager",
    department: "Human Resources",
    status: "Active",
  },
  {
    name: "Neha Kapoor",
    designation: "Financial Analyst",
    department: "Finance",
    status: "Active",
  },
  {
    name: "Kabir Singh",
    designation: "Backend Developer",
    department: "Tech",
    status: "Active",
  },
];

export default function DashboardPage() {
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
              Here's what's happening across your organization today.
            </p>
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

        {/* STAT CARDS */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {stats.map((stat) => {
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
                    This month
                  </span>

                </div>

                <div className="mt-4 text-[27px] font-bold tracking-tight text-slate-900">
                  {stat.value}
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

          <div className="mb-3 flex items-center justify-between">

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Quick Actions
              </h3>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Frequently used HR operations
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="
                    group flex items-center gap-3
                    rounded-xl border border-slate-200
                    bg-white p-3.5
                    shadow-[0_2px_8px_rgba(15,23,42,0.025)]
                    transition
                    hover:border-blue-200
                    hover:bg-blue-50/30
                    hover:shadow-md
                  "
                >

                  <div
                    className="
                      flex h-10 w-10 flex-none
                      items-center justify-center
                      rounded-lg bg-blue-50
                      text-blue-600
                    "
                  >
                    <Icon size={17} />
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="text-xs font-bold text-slate-800">
                      {action.title}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-slate-400">
                      {action.description}
                    </p>

                  </div>

                  <ArrowRight
                    size={14}
                    className="
                      text-slate-300
                      transition
                      group-hover:translate-x-0.5
                      group-hover:text-blue-500
                    "
                  />

                </Link>
              );
            })}

          </div>

        </section>

        {/* MAIN GRID */}

        <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_1fr]">

          {/* WORKFORCE */}

          <section
            className="
              overflow-hidden rounded-xl
              border border-slate-200
              bg-white
              shadow-[0_2px_8px_rgba(15,23,42,0.035)]
            "
          >

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Workforce Overview
                </h3>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  Employee distribution by department
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <TrendingUp size={15} />
              </div>

            </div>

            <div className="space-y-5 p-5">

              {departments.map((department) => (

                <div key={department.name}>

                  <div className="mb-2 flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <span className="h-2 w-2 rounded-full bg-blue-500" />

                      <span className="text-xs font-semibold text-slate-700">
                        {department.name}
                      </span>

                    </div>

                    <span className="text-[10px] text-slate-400">
                      {department.employees} employees · {department.percentage}%
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-blue-500 transition-all"
                      style={{
                        width: `${department.percentage}%`,
                      }}
                    />

                  </div>

                </div>

              ))}

            </div>

          </section>

          {/* HOLIDAYS */}

          <section
            className="
              overflow-hidden rounded-xl
              border border-slate-200
              bg-white
              shadow-[0_2px_8px_rgba(15,23,42,0.035)]
            "
          >

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Upcoming Holidays
                </h3>

                <p className="mt-0.5 text-[10px] text-slate-400">
                  2026 company calendar
                </p>
              </div>

              <Link
                href="/employees"
                className="text-[10px] font-semibold text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>

            </div>

            <div className="divide-y divide-slate-100">

              {holidays.map((holiday) => (

                <div
                  key={holiday.name}
                  className="
                    flex items-center gap-3 px-5 py-3.5
                    transition hover:bg-slate-50
                  "
                >

                  <div
                    className="
                      flex h-11 w-11 flex-none
                      flex-col items-center justify-center
                      rounded-lg bg-blue-50
                    "
                  >
                    <span className="text-[12px] font-bold text-blue-700">
                      {holiday.day}
                    </span>

                    <span className="text-[8px] font-bold tracking-wide text-blue-400">
                      {holiday.month}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-xs font-semibold text-slate-700">
                      {holiday.name}
                    </p>

                    <p className="mt-0.5 text-[9px] text-slate-400">
                      {holiday.type}
                    </p>

                  </div>

                  <CalendarDays
                    size={14}
                    className="text-slate-300"
                  />

                </div>

              ))}

            </div>

          </section>

        </div>

        {/* LOWER GRID */}

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">

          {/* LEAVE */}

          <section className="rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.035)]">

            <div className="border-b border-slate-100 px-5 py-4">

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Leave Overview
                  </h3>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Current leave activity
                  </p>
                </div>

                <CalendarDays
                  size={18}
                  className="text-blue-500"
                />

              </div>

            </div>

            <div className="p-5">

              <div className="flex items-end justify-between">

                <div>
                  <p className="text-[28px] font-bold text-slate-900">
                    12
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Requests this month
                  </p>
                </div>

                <Link
                  href="/leaves"
                  className="text-[10px] font-semibold text-blue-600"
                >
                  Manage →
                </Link>

              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[68%] rounded-full bg-blue-500" />
              </div>

              <div className="mt-2 flex justify-between text-[9px] text-slate-400">
                <span>8 approved</span>
                <span>2 pending</span>
                <span>2 rejected</span>
              </div>

            </div>

          </section>

          {/* NEW HIRES */}

          <section className="rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.035)]">

            <div className="border-b border-slate-100 px-5 py-4">

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    New Hires
                  </h3>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Employees joined this month
                  </p>
                </div>

                <UserRoundCheck
                  size={18}
                  className="text-emerald-500"
                />

              </div>

            </div>

            <div className="p-5">

              <div className="flex items-end justify-between">

                <div>
                  <p className="text-[28px] font-bold text-slate-900">
                    8
                  </p>

                  <p className="text-[10px] text-slate-400">
                    New employees
                  </p>
                </div>

                <Link
                  href="/employees"
                  className="text-[10px] font-semibold text-blue-600"
                >
                  View employees →
                </Link>

              </div>

              <div className="mt-4 flex -space-x-2">

                {["A", "P", "N", "K", "I"].map((letter) => (

                  <div
                    key={letter}
                    className="
                      flex h-8 w-8 items-center justify-center
                      rounded-full border-2 border-white
                      bg-blue-100
                      text-[9px] font-bold text-blue-700
                    "
                  >
                    {letter}
                  </div>

                ))}

                <div
                  className="
                    flex h-8 w-8 items-center justify-center
                    rounded-full border-2 border-white
                    bg-slate-100
                    text-[9px] font-bold text-slate-500
                  "
                >
                  +3
                </div>

              </div>

            </div>

          </section>

          {/* DOCUMENTS */}

          <section className="rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.035)]">

            <div className="border-b border-slate-100 px-5 py-4">

              <div className="flex items-center justify-between">

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Documents
                  </h3>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Employee verification
                  </p>
                </div>

                <FileText
                  size={18}
                  className="text-violet-500"
                />

              </div>

            </div>

            <div className="p-5">

              <div className="flex items-end justify-between">

                <div>
                  <p className="text-[28px] font-bold text-slate-900">
                    96%
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Documents verified
                  </p>
                </div>

                <Link
                  href="/documents"
                  className="text-[10px] font-semibold text-blue-600"
                >
                  Review →
                </Link>

              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[96%] rounded-full bg-emerald-500" />
              </div>

              <div className="mt-2 flex items-center gap-1 text-[9px] text-emerald-600">
                <CircleCheck size={11} />
                118 of 124 employees verified
              </div>

            </div>

          </section>

        </div>

        {/* RECENT EMPLOYEES */}

        <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.035)]">

          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Recent Employees
              </h3>

              <p className="mt-0.5 text-[10px] text-slate-400">
                Latest employee records
              </p>
            </div>

            <Link
              href="/employees"
              className="
                inline-flex items-center gap-1
                text-[10px] font-semibold
                text-blue-600 hover:text-blue-700
              "
            >
              View all
              <ArrowRight size={12} />
            </Link>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px]">

              <thead className="bg-slate-50">

                <tr className="border-b border-slate-100">

                  <th className="px-5 py-3 text-left text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    Employee
                  </th>

                  <th className="px-5 py-3 text-left text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    Department
                  </th>

                  <th className="px-5 py-3 text-left text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    Designation
                  </th>

                  <th className="px-5 py-3 text-left text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {recentEmployees.map((employee) => (

                  <tr
                    key={employee.name}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >

                    <td className="px-5 py-3.5">

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            flex h-8 w-8 items-center justify-center
                            rounded-full bg-blue-100
                            text-[9px] font-bold text-blue-700
                          "
                        >
                          {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>

                        <span className="text-xs font-semibold text-slate-700">
                          {employee.name}
                        </span>

                      </div>

                    </td>

                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {employee.department}
                    </td>

                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {employee.designation}
                    </td>

                    <td className="px-5 py-3.5">

                      <span
                        className="
                          inline-flex items-center gap-1.5
                          rounded-full bg-emerald-50
                          px-2 py-1
                          text-[9px] font-bold text-emerald-700
                        "
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        {employee.status}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </section>

      </main>
    </div>
  );
}
