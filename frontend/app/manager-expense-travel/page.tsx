"use client";

import { useEffect, useState } from "react";
import { Check, X, MessageCircle, Receipt, Plane, RefreshCw } from "lucide-react";

import { WorkspaceShell } from "@/components/workspaces/WorkspaceShell";
import expenseTravelService, {
  Expense,
  Travel,
} from "@/services/expense-travel.service";

export default function ManagerExpenseTravelPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [travel, setTravel] = useState<Travel[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const [e, t] = await Promise.all([
        expenseTravelService.managerExpenses(),
        expenseTravelService.managerTravel(),
      ]);
      setExpenses(e);
      setTravel(t);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("hrhub:realtime", handler);
    const timer = setInterval(load, 12000);

    return () => {
      window.removeEventListener("hrhub:realtime", handler);
      clearInterval(timer);
    };
  }, []);

  const act = async (
    type: "expense" | "travel",
    id: string,
    action: "approve" | "reject" | "clarify",
  ) => {
    const comment =
      window.prompt(
        action === "clarify"
          ? "What clarification is required?"
          : "Comment (optional):",
      ) || "";

    if (action === "clarify" && !comment.trim()) return;

    if (type === "expense") {
      if (action === "clarify")
        await expenseTravelService.managerExpenseClarification(id, comment);
      else
        await expenseTravelService.managerExpenseDecision(
          id,
          action === "approve",
          comment,
        );
    } else {
      if (action === "clarify")
        await expenseTravelService.managerTravelClarification(id, comment);
      else
        await expenseTravelService.managerTravelDecision(
          id,
          action === "approve",
          comment,
        );
    }

    await load();
  };

  return (
    <WorkspaceShell
      role="manager"
      title="Expense & Travel Approvals"
      subtitle="Review requests from your direct reports"
      name="Manager"
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between rounded-2xl bg-gradient-to-br from-brand-dark to-brand p-6 text-white">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[.15em] text-blue-200">
              Manager Workspace
            </p>
            <h1 className="mt-2 text-2xl font-bold">
              Expense & Travel Approvals
            </h1>
            <p className="mt-1 text-sm text-blue-100">
              Review requests from your direct reports.
            </p>
          </div>
          <button onClick={load} className="rounded-lg bg-white/10 p-2">
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <Receipt size={19} className="text-blue-600" />
            <p className="mt-3 text-2xl font-bold">{expenses.length}</p>
            <p className="text-[10px] font-semibold text-slate-400">
              Pending Expenses
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <Plane size={19} className="text-violet-600" />
            <p className="mt-3 text-2xl font-bold">{travel.length}</p>
            <p className="text-[10px] font-semibold text-slate-400">
              Pending Travel
            </p>
          </div>
        </div>

        <Queue
          title="Expense Approvals"
          icon={<Receipt size={18} />}
          loading={loading}
          rows={expenses}
          render={(row) => (
            <>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {row.category}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {row.expense_date} · {row.description}
                </p>
              </div>
              <p className="text-lg font-bold">
                {row.currency} {Number(row.amount).toLocaleString("en-IN")}
              </p>
              <Actions
                onApprove={() => act("expense", row.id, "approve")}
                onReject={() => act("expense", row.id, "reject")}
                onClarify={() => act("expense", row.id, "clarify")}
              />
            </>
          )}
        />

        <Queue
          title="Travel Approvals"
          icon={<Plane size={18} />}
          loading={loading}
          rows={travel}
          render={(row) => (
            <>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {row.destination}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {row.start_date} → {row.end_date} · {row.purpose}
                </p>
              </div>
              <p className="text-lg font-bold">
                {row.currency}{" "}
                {Number(row.estimated_cost).toLocaleString("en-IN")}
              </p>
              <Actions
                onApprove={() => act("travel", row.id, "approve")}
                onReject={() => act("travel", row.id, "reject")}
                onClarify={() => act("travel", row.id, "clarify")}
              />
            </>
          )}
        />
      </div>
    </WorkspaceShell>
  );
}

function Queue({
  title,
  icon,
  rows,
  loading,
  render,
}: {
  title: string;
  icon: React.ReactNode;
  rows: (Expense | Travel)[];
  loading: boolean;
  render: (row: any) => React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
        {icon}
        <h2 className="text-sm font-bold">{title}</h2>
        <span className="ml-auto rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-700">
          {rows.length}
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-400">
          No pending requests.
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid gap-4 px-5 py-4 md:grid-cols-[1fr_auto_auto] md:items-center"
            >
              {render(row)}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function Actions({
  onApprove,
  onReject,
  onClarify,
}: {
  onApprove: () => void;
  onReject: () => void;
  onClarify: () => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={onApprove}
        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold text-white"
      >
        <Check size={12} /> Approve
      </button>
      <button
        onClick={onReject}
        className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-[10px] font-bold text-red-700"
      >
        <X size={12} /> Reject
      </button>
      <button
        onClick={onClarify}
        className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-3 py-2 text-[10px] font-bold text-amber-700"
      >
        <MessageCircle size={12} /> Clarify
      </button>
    </div>
  );
}
