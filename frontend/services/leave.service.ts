import { api } from "@/lib/api";
import type {
  LeaveBalance,
  LeaveRequest,
  LeaveRequestStatus,
  LeaveType,
} from "@/types";

export interface LeaveTypePayload {
  name: string;
  annual_quota_days: number;

  eligibility_gender: "all" | "male" | "female";
  is_paid: boolean;

  carry_forward_allowed: boolean;
  max_carry_forward_days: number;

  encashment_allowed: boolean;

  requires_document: boolean;
  requires_reason: boolean;

  min_days: number;
  max_days: number;
  advance_notice_days: number;

  is_active: boolean;
}

export const leaveService = {
  async listTypes() {
    const { data } = await api.get<LeaveType[]>("/leaves/types");
    return data;
  },

  async createType(payload: LeaveTypePayload) {
    const { data } = await api.post<LeaveType>(
      "/leaves/types",
      payload
    );
    return data;
  },

  async updateType(
    leaveTypeId: string,
    payload: LeaveTypePayload
  ) {
    const { data } = await api.patch<LeaveType>(
      `/leaves/types/${leaveTypeId}`,
      payload
    );
    return data;
  },

  async listForEmployee(employeeId: string) {
    const { data } = await api.get<LeaveRequest[]>(
      `/leaves/employee/${employeeId}`
    );
    return data;
  },

  async getBalance(employeeId: string) {
    const { data } = await api.get<LeaveBalance[]>(
      `/leaves/employee/${employeeId}/balance`
    );
    return data;
  },

  async apply(
    employeeId: string,
    leaveTypeId: string,
    startDate: string,
    endDate: string,
    reason: string
  ) {
    const { data } = await api.post<LeaveRequest>(
      `/leaves/employee/${employeeId}`,
      {
        leave_type_id: leaveTypeId,
        start_date: startDate,
        end_date: endDate,
        reason,
      }
    );

    return data;
  },

  async decide(
    requestId: string,
    status: LeaveRequestStatus
  ) {
    const { data } = await api.patch<LeaveRequest>(
      `/leaves/${requestId}/decision`,
      { status }
    );

    return data;
  },
};
