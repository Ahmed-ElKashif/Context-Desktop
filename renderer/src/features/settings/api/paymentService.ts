/**
 * paymentService.ts
 * API calls for the InstaPay payment request flow.
 * Users submit payment screenshots → Admins approve/reject.
 */

import { api } from "../../../lib/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaymentRequest {
  _id: string;
  userId: string;
  username: string;
  email: string;
  avatar?: string;
  planId: "sandbox" | "startup" | "growth" | "embed";
  billingCycle: "monthly" | "annual";
  amount: number;
  senderName: string;
  phoneNumber: string;
  screenshotUrl: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface PaymentRequestsResponse {
  requests: PaymentRequest[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  counts: {
    all: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface GetPaymentRequestsParams {
  status?: "pending" | "approved" | "rejected";
  page?: number;
  limit?: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const paymentService = {
  /**
   * Submit a new payment request with screenshot.
   * Sends multipart/form-data to POST /api/payments/request
   */
  async submitPaymentRequest(formData: FormData): Promise<PaymentRequest> {
    const res = await api.post<{ success: boolean; data: PaymentRequest }>(
      "/payments/request",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data.data ?? res.data;
  },

  /**
   * Fetch paginated payment requests for admin dashboard.
   */
  async getPaymentRequests(
    params: GetPaymentRequestsParams = {}
  ): Promise<PaymentRequestsResponse> {
    const res = await api.get<{ success: boolean; data: PaymentRequestsResponse }>(
      "/admin/payments",
      { params }
    );
    return res.data.data ?? res.data;
  },

  /**
   * Approve or reject a payment request.
   */
  async updatePaymentStatus(
    requestId: string,
    status: "approved" | "rejected"
  ): Promise<void> {
    await api.patch(`/admin/payments/${requestId}/status`, { status });
  },
};
