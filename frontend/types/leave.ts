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
