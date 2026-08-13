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
} from "lucide-react";

import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";

export default function DashboardPage() {

  const stats = [
    {
      label: "Total Employees",
      value: "124",
      icon: Users,
      change: "+8.4% this month",
      type: "up",
    },
    {
      label: "Present Today",
      value: "112",
      icon: Clock3,
      change: "90.3% attendance",
      type: "up",
    },
    {
      label: "On Leave",
      value: "8",
      icon: CalendarDays,
      change: "2 pending approvals",
      type: "warning",
    },
    {
      label: "Payroll",
      value: "₹9.4L",
      icon: WalletCards,
      change: "August processed",
      type: "up",
    },
  ];

  const quickActions = [
    {
      label: "Add Employee",
      href: "/employees",
      icon: UserPlus,
    },
    {
      label: "Recruitment",
      href: "/recruitment",
      icon: UserCheck,
    },
    {
      label: "Leave Requests",
      href: "/leaves",
      icon: CalendarDays,
    },
    {
      label: "Payroll",
      href: "/payroll",
      icon: WalletCards,
    },
  ];

  return (
    <>
      <Topbar
        title="Dashboard"
        subtitle="Your HR workspace at a glance"
      />

      <div className="hr-page">

        {/* HEADER */}

        <div className="hr-page-header">

          <div>
            <div className="hr-page-title">
              Good evening, Admin 👋
            </div>

            <div className="hr-page-subtitle">
              Here's what's happening across your organization today.
            </div>
          </div>

          <div className="hr-actions">
            <Link
              href="/employees"
              className="
                inline-flex items-center gap-2
                rounded-lg bg-blue-600 px-4 py-2.5
                text-xs font-semibold text-white
                shadow-sm hover:bg-blue-700
              "
            >
              <UserPlus size={14} />
              Add Employee
            </Link>
          </div>

        </div>

        {/* STATISTICS */}

        <div className="hr-stat-grid">

          {stats.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="hr-stat">

                <div className="hr-stat-icon">
                  <Icon size={18} />
                </div>

                <div className="hr-stat-value">
                  {item.value}
                </div>

                <div className="hr-stat-label">
                  {item.label}
                </div>

                <div
                  className={[
                    "hr-stat-change",
                    item.type === "up"
                      ? "up"
                      : "",
                  ].join(" ")}
                >
                  {item.change}
                </div>

              </div>
            );
          })}

        </div>

        {/* QUICK ACTIONS */}

        <div className="mt-5">

          <div className="mb-3 text-sm font-bold text-slate-800">
            Quick Actions
          </div>

          <div className="hr-quick-actions">

            {quickActions.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="hr-quick-action"
                >
                  <div className="hr-quick-action-icon">
                    <Icon size={16} />
                  </div>

                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-800">
                      {item.label}
                    </div>

                    <div className="mt-0.5 text-[9px] text-slate-400">
                      Open module
                    </div>
                  </div>

                  <ArrowRight
                    size={14}
                    className="text-slate-300"
                  />
                </Link>
              );
            })}

          </div>

        </div>

        {/* MAIN WIDGETS */}

        <div className="hr-dashboard-grid mt-5">

          <div className="hr-card">

            <div className="hr-card-header">

              <div>
                <div className="hr-card-title">
                  Workforce Overview
                </div>

                <div className="hr-card-description">
                  Employee distribution and attendance
                </div>
              </div>

              <TrendingUp
                size={17}
                className="text-blue-500"
              />

            </div>

            <div className="hr-card-body">

              <div className="space-y-5">

                {[
                  ["Engineering", 48, "39%"],
                  ["Human Resources", 22, "18%"],
                  ["Finance", 18, "15%"],
                  ["Operations", 21, "17%"],
                  ["Sales", 15, "12%"],
                ].map(([name, value, percent]) => (

                  <div key={name as string}>

                    <div className="mb-2 flex items-center justify-between">

                      <span className="text-xs font-semibold text-slate-600">
                        {name}
                      </span>

                      <span className="text-[10px] text-slate-400">
                        {value} employees · {percent}
                      </span>

                    </div>

                    <div className="hr-progress">
                      <div
                        style={{
                          width: percent as string,
                        }}
                      />
                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

          <div className="hr-card">

            <div className="hr-card-header">

              <div>
                <div className="hr-card-title">
                  Upcoming Holidays
                </div>

                <div className="hr-card-description">
                  Company calendar
                </div>
              </div>

              <Link
                href="/employees"
                className="text-[10px] font-semibold text-blue-600"
              >
                View all
              </Link>

            </div>

            <div className="hr-card-body">

              <div className="space-y-1">

                {[
                  ["15", "Aug", "Independence Day"],
                  ["02", "Oct", "Gandhi Jayanti"],
                  ["08", "Nov", "Diwali"],
                  ["25", "Dec", "Christmas"],
                ].map(([day, month, name]) => (

                  <div
                    key={name}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50"
                  >

                    <div
                      className="
                        flex h-10 w-10 flex-col
                        items-center justify-center
                        rounded-lg bg-blue-50
                      "
                    >
                      <span className="text-[10px] font-bold text-blue-700">
                        {day}
                      </span>

                      <span className="text-[8px] font-semibold uppercase text-blue-400">
                        {month}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        {name}
                      </p>

                      <p className="mt-0.5 text-[9px] text-slate-400">
                        Company holiday
                      </p>
                    </div>

                  </div>

                ))}

              </div>

            </div>

          </div>

        </div>

        {/* LOWER WIDGETS */}

        <div className="hr-dashboard-grid-3 mt-5">

          <Card className="hr-card overflow-hidden p-0">

            <div className="hr-card-header">
              <div>
                <div className="hr-card-title">
                  Leave Overview
                </div>
                <div className="hr-card-description">
                  Current requests
                </div>
              </div>
            </div>

            <div className="hr-card-body">

              <div className="flex items-center justify-between">

                <div>
                  <div className="text-2xl font-bold text-slate-800">
                    12
                  </div>

                  <div className="text-[10px] text-slate-400">
                    Requests this month
                  </div>
                </div>

                <CalendarDays
                  size={28}
                  className="text-blue-200"
                />

              </div>

            </div>

          </Card>

          <Card className="hr-card overflow-hidden p-0">

            <div className="hr-card-header">
              <div>
                <div className="hr-card-title">
                  New Hires
                </div>
                <div className="hr-card-description">
                  This month
                </div>
              </div>
            </div>

            <div className="hr-card-body">

              <div className="flex items-center justify-between">

                <div>
                  <div className="text-2xl font-bold text-slate-800">
                    8
                  </div>

                  <div className="text-[10px] text-slate-400">
                    Employees joined
                  </div>
                </div>

                <UserPlus
                  size={28}
                  className="text-blue-200"
                />

              </div>

            </div>

          </Card>

          <Card className="hr-card overflow-hidden p-0">

            <div className="hr-card-header">
              <div>
                <div className="hr-card-title">
                  Documents
                </div>
                <div className="hr-card-description">
                  Verification status
                </div>
              </div>
            </div>

            <div className="hr-card-body">

              <div className="flex items-center justify-between">

                <div>
                  <div className="text-2xl font-bold text-slate-800">
                    96%
                  </div>

                  <div className="text-[10px] text-slate-400">
                    Verified
                  </div>
                </div>

                <FileText
                  size={28}
                  className="text-blue-200"
                />

              </div>

            </div>

          </Card>

        </div>

      </div>
    </>
  );
}
