import { api } from "@/lib/api";

export type Expense = {
  id: string;
  employee_id: string;
  category: string;
  amount: string | number;
  currency: string;
  expense_date: string;
  description: string;
  status: string;
  manager_status: string;
  manager_comment: string | null;
  hr_status: string;
  hr_comment: string | null;
  settlement_status: string;
  settled_amount: string | number | null;
  settlement_reference: string | null;
  document_ids: string[];
};

export type Travel = {
  id: string;
  employee_id: string;
  destination: string;
  purpose: string;
  start_date: string;
  end_date: string;
  transport: string | null;
  accommodation: string | null;
  estimated_cost: string | number;
  currency: string;
  advance_required: boolean;
  advance_amount: string | number | null;
  notes: string | null;
  status: string;
  manager_status: string;
  manager_comment: string | null;
  hr_status: string;
  hr_comment: string | null;
  settlement_status: string;
  settled_amount: string | number | null;
  settlement_reference: string | null;
  document_ids: string[];
};

const expenseTravelService = {
  listExpenses: async () =>
    (await api.get<Expense[]>("/expenses")).data,

  createExpense: async (payload: {
    category: string;
    amount: number;
    currency: string;
    expense_date: string;
    description: string;
    document_ids?: string[];
  }) =>
    (await api.post<Expense>("/expenses", payload)).data,

  managerExpenses: async () =>
    (await api.get<Expense[]>("/expenses/manager/pending")).data,

  hrExpenses: async () =>
    (await api.get<Expense[]>("/expenses/hr/pending")).data,

  hrSettlementExpenses: async () =>
    (await api.get<Expense[]>("/expenses/hr/settlement-pending")).data,

  managerExpenseDecision: async (
    id: string,
    approve: boolean,
    comment?: string,
  ) =>
    (
      await api.post<Expense>(
        `/expenses/${id}/manager-decision`,
        { approve, comment },
      )
    ).data,

  managerExpenseClarification: async (
    id: string,
    comment: string,
  ) =>
    (
      await api.post<Expense>(
        `/expenses/${id}/manager-clarification`,
        { comment },
      )
    ).data,

  hrExpenseDecision: async (
    id: string,
    approve: boolean,
    comment?: string,
  ) =>
    (
      await api.post<Expense>(
        `/expenses/${id}/hr-decision`,
        { approve, comment },
      )
    ).data,

  hrExpenseClarification: async (
    id: string,
    comment: string,
  ) =>
    (
      await api.post<Expense>(
        `/expenses/${id}/hr-clarification`,
        { comment },
      )
    ).data,

  resubmitExpense: async (id: string, comment: string) =>
    (
      await api.post<Expense>(
        `/expenses/${id}/resubmit`,
        { comment },
      )
    ).data,

  settleExpense: async (
    id: string,
    settled_amount?: number,
    settlement_reference?: string,
  ) =>
    (
      await api.post<Expense>(
        `/expenses/${id}/settle`,
        { settled_amount, settlement_reference },
      )
    ).data,

  listTravel: async () =>
    (await api.get<Travel[]>("/expenses/travel")).data,

  createTravel: async (payload: {
    destination: string;
    purpose: string;
    start_date: string;
    end_date: string;
    transport?: string;
    accommodation?: string;
    estimated_cost: number;
    currency: string;
    advance_required: boolean;
    advance_amount?: number;
    notes?: string;
    document_ids?: string[];
  }) =>
    (await api.post<Travel>("/expenses/travel", payload)).data,

  managerTravel: async () =>
    (await api.get<Travel[]>("/expenses/travel/manager/pending")).data,

  hrTravel: async () =>
    (await api.get<Travel[]>("/expenses/travel/hr/pending")).data,

  hrSettlementTravel: async () =>
    (await api.get<Travel[]>("/expenses/travel/hr/settlement-pending")).data,

  managerTravelDecision: async (
    id: string,
    approve: boolean,
    comment?: string,
  ) =>
    (
      await api.post<Travel>(
        `/expenses/travel/${id}/manager-decision`,
        { approve, comment },
      )
    ).data,

  managerTravelClarification: async (
    id: string,
    comment: string,
  ) =>
    (
      await api.post<Travel>(
        `/expenses/travel/${id}/manager-clarification`,
        { comment },
      )
    ).data,

  hrTravelDecision: async (
    id: string,
    approve: boolean,
    comment?: string,
  ) =>
    (
      await api.post<Travel>(
        `/expenses/travel/${id}/hr-decision`,
        { approve, comment },
      )
    ).data,

  hrTravelClarification: async (
    id: string,
    comment: string,
  ) =>
    (
      await api.post<Travel>(
        `/expenses/travel/${id}/hr-clarification`,
        { comment },
      )
    ).data,

  resubmitTravel: async (id: string, comment: string) =>
    (
      await api.post<Travel>(
        `/expenses/travel/${id}/resubmit`,
        { comment },
      )
    ).data,

  settleTravel: async (
    id: string,
    settled_amount?: number,
    settlement_reference?: string,
  ) =>
    (
      await api.post<Travel>(
        `/expenses/travel/${id}/settle`,
        { settled_amount, settlement_reference },
      )
    ).data,

  history: async (type: "expense" | "travel", id: string) =>
    (
      await api.get(
        `/expenses/history/${type}/${id}`,
      )
    ).data,
};

export default expenseTravelService;
