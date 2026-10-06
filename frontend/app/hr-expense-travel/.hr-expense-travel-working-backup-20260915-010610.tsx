"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  X,
  MessageCircle,
  Receipt,
  Plane,
  WalletCards,
  RefreshCw,
  Download,
  FileText,
  Eye,
  CreditCard,
  Clock,
  User,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";

import { Topbar } from "@/components/layout/Topbar";
import expenseTravelService, {
  Expense,
  Travel,
} from "@/services/expense-travel.service";
import { documentService } from "@/services/document.service";
import type { DocumentRecord, DocumentStatus } from "@/types";
import { authService } from "@/services/auth.service";

const HR_ROLES = ["hr_admin", "hr_executive", "system_admin"];

type RequestType = "expense" | "travel";

type HistoryItem = {
  id: string;
  request_type: string;
  request_id: string;
  action: string;
  performed_by: string;
  comment: string | null;
  created_at: string;
};

const STATUS_STYLES: Record<string, string> = {
  pending_hr: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  clarification_required: "bg-orange-50 text-orange-700",
  pending_manager: "bg-blue-50 text-blue-700",
  settled: "bg-emerald-50 text-emerald-700",
  pending: "bg-slate-100 text-slate-600",
};

function StatusBadge({ status }: { status: string }) {
  const label = status.replaceAll("_", " ");

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${
        STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600"
      }`}
    >
      {label}
    </span>
  );
}

function formatAmount(value: string | number | null | undefined, currency = "INR") {
  if (value === null || value === undefined) return "—";

  return `${currency} ${Number(value).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

export default function HRExpenseTravelPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [travel, setTravel] = useState<Travel[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<"expenses" | "travel">("expenses");

  const [selected, setSelected] = useState<{
    type: RequestType;
    row: Expense | Travel;
  } | null>(null);

  const load = async () => {
    try {
      setError("");

      const [expenseRows, travelRows] = await Promise.all([
        expenseTravelService.hrExpenses(),
        expenseTravelService.hrTravel(),
      ]);

      setExpenses(expenseRows);
      setTravel(travelRows);
    } catch (err) {
      console.error("Unable to load HR expense/travel queue", err);
      setError("Unable to load the HR approval queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    authService
      .me()
      .then((me) => {
        if (!mounted) return;

        if (!HR_ROLES.includes(me.role)) {
          router.replace(
            me.role === "reporting_manager" ? "/manager" : "/my-workspace",
          );
          return;
        }

        setAuthorized(true);
        setCheckingAccess(false);
      })
      .catch(() => {
        if (!mounted) return;
        router.replace("/login");
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  useEffect(() => {
    if (!authorized) return;

    load();

    const handler = () => {
      load();
    };

    window.addEventListener("hrhub:realtime", handler);

    const timer = window.setInterval(load, 12000);

    return () => {
      window.removeEventListener("hrhub:realtime", handler);
      window.clearInterval(timer);
    };
  }, [authorized]);

  const totalAwaiting = expenses.length + travel.length;

  const approvedForSettlementExpenses = useMemo(
    () =>
      expenses.filter(
        (item) =>
          item.hr_status === "approved" &&
          item.settlement_status !== "settled",
      ),
    [expenses],
  );

  const approvedForSettlementTravel = useMemo(
    () =>
      travel.filter(
        (item) =>
          item.hr_status === "approved" &&
          item.settlement_status !== "settled",
      ),
    [travel],
  );

  if (checkingAccess) {
    return (
      <div className="min-h-screen bg-[#f6f8fc]">
        <Topbar title="Expense & Travel" subtitle="HR administration" />
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-sm text-slate-400">
            Checking HR access...
          </div>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="min-h-screen bg-[#f6f8fc]">
      <Topbar
        title="Expense & Travel"
        subtitle="HR approvals, document verification and settlements"
      />

      <main className="w-full px-5 py-5 md:px-7 lg:px-8">
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-dark to-brand p-6 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.15em] text-blue-200">
                HR Administration
              </p>

              <h1 className="mt-2 text-2xl font-bold">
                Expense & Travel Management
              </h1>

              <p className="mt-1 max-w-2xl text-sm text-blue-100">
                Review manager-approved requests, verify supporting documents,
                complete final approval and settle employee claims.
              </p>
            </div>

            <button
              type="button"
              onClick={load}
              className="rounded-lg bg-white/10 p-2 transition hover:bg-white/20"
              title="Refresh"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={17} />
            {error}
          </div>
        )}

        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Kpi
            icon={<Receipt size={18} />}
            label="Pending expenses"
            value={expenses.length}
          />

          <Kpi
            icon={<Plane size={18} />}
            label="Pending travel"
            value={travel.length}
          />

          <Kpi
            icon={<CreditCard size={18} />}
            label="Awaiting settlement"
            value={
              approvedForSettlementExpenses.length +
              approvedForSettlementTravel.length
            }
          />

          <Kpi
            icon={<WalletCards size={18} />}
            label="Total HR queue"
            value={totalAwaiting}
          />
        </div>

        <div className="mb-5 flex gap-2 rounded-xl border border-slate-200 bg-white p-1.5">
          <TabButton
            active={activeTab === "expenses"}
            onClick={() => setActiveTab("expenses")}
            icon={<Receipt size={15} />}
            label={`Expenses (${expenses.length})`}
          />

          <TabButton
            active={activeTab === "travel"}
            onClick={() => setActiveTab("travel")}
            icon={<Plane size={15} />}
            label={`Travel (${travel.length})`}
          />
        </div>

        {activeTab === "expenses" ? (
          <RequestTable
            title="Expense Approval Queue"
            type="expense"
            rows={expenses}
            loading={loading}
            onOpen={(row) => setSelected({ type: "expense", row })}
          />
        ) : (
          <RequestTable
            title="Travel Approval Queue"
            type="travel"
            rows={travel}
            loading={loading}
            onOpen={(row) => setSelected({ type: "travel", row })}
          />
        )}
      </main>

      {selected && (
        <RequestDetailsModal
          type={selected.type}
          row={selected.row}
          onClose={() => setSelected(null)}
          onChanged={async () => {
            setSelected(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="text-blue-600">{icon}</div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-[10px] font-semibold text-slate-400">{label}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
        active
          ? "bg-brand text-white shadow-sm"
          : "text-slate-500 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function RequestTable({
  title,
  type,
  rows,
  loading,
  onOpen,
}: {
  title: string;
  type: RequestType;
  rows: (Expense | Travel)[];
  loading: boolean;
  onOpen: (row: Expense | Travel) => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <p className="mt-0.5 text-[10px] text-slate-400">
            Manager-approved requests awaiting HR action
          </p>
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
          {rows.length} pending
        </span>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">
          Loading HR requests...
        </div>
      ) : rows.length === 0 ? (
        <div className="p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-300">
            {type === "expense" ? (
              <Receipt size={22} />
            ) : (
              <Plane size={22} />
            )}
          </div>

          <p className="mt-3 text-sm font-semibold text-slate-600">
            No pending requests
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Manager-approved {type} requests will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {rows.map((row) => {
            const isExpense = type === "expense";
            const expense = row as Expense;
            const travel = row as Travel;

            return (
              <button
                key={row.id}
                type="button"
                onClick={() => onOpen(row)}
                className="grid w-full gap-4 px-5 py-4 text-left transition hover:bg-slate-50 md:grid-cols-[1fr_auto_auto_auto] md:items-center"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {isExpense ? expense.category : travel.destination}
                    </p>

                    <StatusBadge status={row.status} />
                  </div>

                  <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                    <User size={11} />
                    Employee ID: {row.employee_id}
                  </p>

                  <p className="mt-1 truncate text-[11px] text-slate-400">
                    {isExpense
                      ? `${expense.expense_date} · ${expense.description}`
                      : `${travel.start_date} → ${travel.end_date} · ${travel.purpose}`}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    {isExpense
                      ? formatAmount(expense.amount, expense.currency)
                      : formatAmount(
                          travel.estimated_cost,
                          travel.currency,
                        )}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    HR: {row.hr_status.replaceAll("_", " ")}
                  </p>
                </div>

                <div className="hidden md:block">
                  <DocumentCount count={row.document_ids?.length ?? 0} />
                </div>

                <div className="flex items-center justify-end">
                  <span className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-600">
                    Review
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

function DocumentCount({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
      <FileText size={11} />
      {count} {count === 1 ? "document" : "documents"}
    </span>
  );
}

function RequestDetailsModal({
  type,
  row,
  onClose,
  onChanged,
}: {
  type: RequestType;
  row: Expense | Travel;
  onClose: () => void;
  onChanged: () => Promise<void>;
}) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [expandedHistory, setExpandedHistory] = useState(false);
  const [working, setWorking] = useState(false);
  const [modalError, setModalError] = useState("");

  const [settlementAmount, setSettlementAmount] = useState(
    type === "expense"
      ? String((row as Expense).amount ?? "")
      : String((row as Travel).estimated_cost ?? ""),
  );
  const [settlementReference, setSettlementReference] = useState("");

  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const result = await documentService.listForEmployee(row.employee_id);
      setDocuments(
        result.filter((doc) =>
          type === "expense"
            ? doc.document_type === "expense_receipt"
            : doc.document_type === "travel_document",
        ),
      );
    } catch (err) {
      console.error("Could not load request documents", err);
      setModalError("Could not load supporting documents.");
    } finally {
      setLoadingDocuments(false);
    }
  };

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const result = await expenseTravelService.history(type, row.id);
      setHistory(result as HistoryItem[]);
    } catch (err) {
      console.error("Could not load approval history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    loadHistory();
  }, [row.id, row.employee_id, type]);

  const decide = async (
    action: "approve" | "reject" | "clarify",
  ) => {
    const comment =
      window.prompt(
        action === "clarify"
          ? "What clarification is required?"
          : "Comment (optional):",
      ) || "";

    if (action === "clarify" && !comment.trim()) return;

    try {
      setWorking(true);
      setModalError("");

      if (type === "expense") {
        if (action === "clarify") {
          await expenseTravelService.hrExpenseClarification(
            row.id,
            comment,
          );
        } else {
          await expenseTravelService.hrExpenseDecision(
            row.id,
            action === "approve",
            comment,
          );
        }
      } else {
        if (action === "clarify") {
          await expenseTravelService.hrTravelClarification(
            row.id,
            comment,
          );
        } else {
          await expenseTravelService.hrTravelDecision(
            row.id,
            action === "approve",
            comment,
          );
        }
      }

      await onChanged();
    } catch (err) {
      console.error("HR decision failed", err);
      setModalError("The HR action could not be completed.");
    } finally {
      setWorking(false);
    }
  };

  const settle = async () => {
    const amount = Number(settlementAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setModalError("Enter a valid settlement amount.");
      return;
    }

    try {
      setWorking(true);
      setModalError("");

      if (type === "expense") {
        await expenseTravelService.settleExpense(
          row.id,
          amount,
          settlementReference.trim() || undefined,
        );
      } else {
        await expenseTravelService.settleTravel(
          row.id,
          amount,
          settlementReference.trim() || undefined,
        );
      }

      await onChanged();
    } catch (err) {
      console.error("Settlement failed", err);
      setModalError("The settlement could not be completed.");
    } finally {
      setWorking(false);
    }
  };

  const handleVerify = async (
    documentId: string,
    status: DocumentStatus,
  ) => {
    try {
      setWorking(true);
      setModalError("");

      let notes: string | undefined;

      if (status === "rejected") {
        notes =
          window.prompt("Reason for rejecting this document:") || undefined;
      }

      await documentService.verify(documentId, status, notes);
      await loadDocuments();
    } catch (err) {
      console.error("Document verification failed", err);
      setModalError("Could not update document status.");
    } finally {
      setWorking(false);
    }
  };

  const handleDownload = async (doc: DocumentRecord) => {
    try {
      setWorking(true);
      setModalError("");
      await documentService.download(doc.id, doc.file_name);
    } catch (err) {
      console.error("Document download failed", err);
      setModalError("Could not download this document.");
    } finally {
      setWorking(false);
    }
  };

  const isApproved = row.hr_status === "approved";
  const isSettled = row.settlement_status === "settled";

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm md:items-center md:p-5">
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl md:rounded-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 md:px-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {type === "expense" ? "Expense Request" : "Travel Request"}
              </p>

              <StatusBadge status={row.status} />

              {isSettled && <StatusBadge status="settled" />}
            </div>

            <h2 className="mt-1 truncate text-lg font-bold text-slate-900">
              {type === "expense"
                ? (row as Expense).category
                : (row as Travel).destination}
            </h2>

            <p className="mt-1 text-[11px] text-slate-400">
              Request ID: {row.id}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 md:p-6">
          {modalError && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              <AlertCircle size={15} />
              {modalError}
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-[1.4fr_.9fr]">
            <div className="space-y-5">
              <RequestInformation type={type} row={row} />

              <DocumentPanel
                documents={documents}
                loading={loadingDocuments}
                working={working}
                onDownload={handleDownload}
                onVerify={handleVerify}
              />

              <HistoryPanel
                history={history}
                loading={loadingHistory}
                expanded={expandedHistory}
                onToggle={() => setExpandedHistory((value) => !value)}
              />
            </div>

            <div className="space-y-5">
              <ApprovalStatusPanel row={row} />

              {!isApproved && !isSettled && (
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-bold text-slate-900">
                    HR Decision
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Complete final HR review after checking the request and
                    supporting documents.
                  </p>

                  <div className="mt-4 grid gap-2">
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => decide("approve")}
                      className="rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
                    >
                      <Check size={14} className="mr-1.5 inline" />
                      Approve Request
                    </button>

                    <button
                      type="button"
                      disabled={working}
                      onClick={() => decide("reject")}
                      className="rounded-lg bg-red-50 px-4 py-2.5 text-xs font-bold text-red-700 disabled:opacity-50"
                    >
                      <X size={14} className="mr-1.5 inline" />
                      Reject Request
                    </button>

                    <button
                      type="button"
                      disabled={working}
                      onClick={() => decide("clarify")}
                      className="rounded-lg bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-700 disabled:opacity-50"
                    >
                      <MessageCircle size={14} className="mr-1.5 inline" />
                      Request Clarification
                    </button>
                  </div>
                </div>
              )}

              {isApproved && !isSettled && (
                <SettlementPanel
                  amount={settlementAmount}
                  reference={settlementReference}
                  working={working}
                  onAmountChange={setSettlementAmount}
                  onReferenceChange={setSettlementReference}
                  onSettle={settle}
                />
              )}

              {isSettled && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <Check size={17} />
                    <p className="text-sm font-bold">
                      Request Settled
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3 text-xs">
                    <DetailRow
                      label="Settled amount"
                      value={formatAmount(
                        row.settled_amount,
                        row.currency,
                      )}
                    />

                    <DetailRow
                      label="Reference"
                      value={row.settlement_reference || "—"}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-right md:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function RequestInformation({
  type,
  row,
}: {
  type: RequestType;
  row: Expense | Travel;
}) {
  const expense = row as Expense;
  const travel = row as Travel;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          {type === "expense" ? (
            <Receipt size={16} />
          ) : (
            <Plane size={16} />
          )}
        </div>

        <div>
          <p className="text-xs font-bold text-slate-900">
            Request Details
          </p>
          <p className="text-[10px] text-slate-400">
            Submitted by employee
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <DetailRow label="Employee ID" value={row.employee_id} />

        {type === "expense" ? (
          <>
            <DetailRow label="Category" value={expense.category} />
            <DetailRow
              label="Amount"
              value={formatAmount(expense.amount, expense.currency)}
            />
            <DetailRow label="Expense date" value={expense.expense_date} />
            <div className="sm:col-span-2">
              <DetailRow
                label="Description"
                value={expense.description}
              />
            </div>
          </>
        ) : (
          <>
            <DetailRow label="Destination" value={travel.destination} />
            <DetailRow label="Purpose" value={travel.purpose} />
            <DetailRow
              label="Travel dates"
              value={`${travel.start_date} → ${travel.end_date}`}
            />
            <DetailRow
              label="Estimated cost"
              value={formatAmount(
                travel.estimated_cost,
                travel.currency,
              )}
            />
            <DetailRow
              label="Transport"
              value={travel.transport || "Not specified"}
            />
            <DetailRow
              label="Accommodation"
              value={travel.accommodation || "Not specified"}
            />
            <DetailRow
              label="Advance"
              value={
                travel.advance_required
                  ? formatAmount(
                      travel.advance_amount,
                      travel.currency,
                    )
                  : "No advance requested"
              }
            />

            {travel.notes && (
              <div className="sm:col-span-2">
                <DetailRow label="Notes" value={travel.notes} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ApprovalStatusPanel({
  row,
}: {
  row: Expense | Travel;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-bold text-slate-900">
        Approval Status
      </p>

      <div className="mt-4 space-y-3">
        <StatusLine
          label="Manager"
          status={row.manager_status}
          comment={row.manager_comment}
        />

        <StatusLine
          label="HR"
          status={row.hr_status}
          comment={row.hr_comment}
        />

        <StatusLine
          label="Settlement"
          status={row.settlement_status}
        />
      </div>
    </div>
  );
}

function StatusLine({
  label,
  status,
  comment,
}: {
  label: string;
  status: string;
  comment?: string | null;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-600">
          {label}
        </span>
        <StatusBadge status={status} />
      </div>

      {comment && (
        <p className="mt-2 text-[10px] leading-4 text-slate-400">
          {comment}
        </p>
      )}
    </div>
  );
}

function DocumentPanel({
  documents,
  loading,
  working,
  onDownload,
  onVerify,
}: {
  documents: DocumentRecord[];
  loading: boolean;
  working: boolean;
  onDownload: (doc: DocumentRecord) => Promise<void>;
  onVerify: (
    documentId: string,
    status: DocumentStatus,
  ) => Promise<void>;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-900">
            Supporting Documents
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            Verify receipts and travel documents before final approval.
          </p>
        </div>

        <DocumentCount count={documents.length} />
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">
          Loading documents...
        </div>
      ) : documents.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-slate-200 p-6 text-center">
          <FileText size={22} className="mx-auto text-slate-300" />
          <p className="mt-2 text-xs font-semibold text-slate-500">
            No supporting document found
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            The employee has not attached a matching expense receipt or travel
            document.
          </p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="rounded-lg border border-slate-100 bg-slate-50 p-3"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600">
                  <FileText size={16} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-700">
                    {doc.file_name}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {doc.document_type.replaceAll("_", " ")} ·{" "}
                    {Math.max(1, Math.round(doc.file_size_bytes / 1024))} KB
                  </p>

                  <div className="mt-2">
                    <StatusBadge status={doc.status} />
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={working}
                  onClick={() => onDownload(doc)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  <Download size={12} className="mr-1 inline" />
                  Download
                </button>

                <button
                  type="button"
                  disabled={working}
                  onClick={() => onDownload(doc)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
                >
                  <Eye size={12} className="mr-1 inline" />
                  View
                </button>

                {doc.status === "submitted" && (
                  <>
                    <button
                      type="button"
                      disabled={working}
                      onClick={() => onVerify(doc.id, "verified")}
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold text-white disabled:opacity-50"
                    >
                      <Check size={12} className="mr-1 inline" />
                      Verify
                    </button>

                    <button
                      type="button"
                      disabled={working}
                      onClick={() => onVerify(doc.id, "rejected")}
                      className="rounded-lg bg-red-50 px-3 py-2 text-[10px] font-bold text-red-700 disabled:opacity-50"
                    >
                      <X size={12} className="mr-1 inline" />
                      Reject Document
                    </button>
                  </>
                )}
              </div>

              {doc.notes && (
                <p className="mt-3 rounded-lg bg-white px-3 py-2 text-[10px] text-slate-500">
                  <strong>HR note:</strong> {doc.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettlementPanel({
  amount,
  reference,
  working,
  onAmountChange,
  onReferenceChange,
  onSettle,
}: {
  amount: string;
  reference: string;
  working: boolean;
  onAmountChange: (value: string) => void;
  onReferenceChange: (value: string) => void;
  onSettle: () => Promise<void>;
}) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
          <CreditCard size={16} />
        </div>

        <div>
          <p className="text-xs font-bold text-slate-900">
            Settlement
          </p>
          <p className="text-[10px] text-slate-400">
            Record payment/settlement for this approved request.
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className="mb-1 block text-[10px] font-bold text-slate-500">
            Settled Amount
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-brand"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] font-bold text-slate-500">
            Settlement Reference
          </label>
          <input
            value={reference}
            onChange={(e) => onReferenceChange(e.target.value)}
            placeholder="e.g. NEFT-2026-000123"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-brand"
          />
        </div>

        <button
          type="button"
          disabled={working}
          onClick={onSettle}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50"
        >
          <CreditCard size={14} className="mr-1.5 inline" />
          Mark as Settled
        </button>
      </div>
    </div>
  );
}

function HistoryPanel({
  history,
  loading,
  expanded,
  onToggle,
}: {
  history: HistoryItem[];
  loading: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <p className="text-xs font-bold text-slate-900">
            Approval History
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            Complete request activity and comments
          </p>
        </div>

        {expanded ? (
          <ChevronUp size={16} className="text-slate-400" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="mt-4">
          {loading ? (
            <p className="py-5 text-center text-xs text-slate-400">
              Loading history...
            </p>
          ) : history.length === 0 ? (
            <p className="py-5 text-center text-xs text-slate-400">
              No history available.
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="relative border-l-2 border-slate-200 pl-4"
                >
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-slate-400" />
                    <p className="text-[11px] font-bold capitalize text-slate-700">
                      {item.action.replaceAll("_", " ")}
                    </p>
                  </div>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {new Date(item.created_at).toLocaleString("en-IN")}
                  </p>

                  {item.comment && (
                    <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-[10px] leading-4 text-slate-500">
                      {item.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}
