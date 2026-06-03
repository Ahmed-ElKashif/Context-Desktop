/**
 * PaymentRequestsSection.tsx
 * Admin panel for reviewing InstaPay payment requests.
 * Shows payment requests table with screenshot preview, approve/reject actions.
 */

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { paymentService, PaymentRequest } from "../../settings/api/paymentService";
import { Icon } from "../../../components/ui/Icons";

// ─── Status filter tabs ───────────────────────────────────────────────────────

type StatusFilter = "all" | "pending" | "approved" | "rejected";

const STATUS_TABS: { id: StatusFilter; label: string; icon: string }[] = [
  { id: "all", label: "All", icon: "list" },
  { id: "pending", label: "Pending", icon: "schedule" },
  { id: "approved", label: "Approved", icon: "check_circle" },
  { id: "rejected", label: "Rejected", icon: "cancel" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLAN_LABELS: Record<string, string> = {
  sandbox: "Sandbox",
  startup: "Startup",
  growth: "Growth",
  embed: "Enterprise",
};

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB");
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
          Pending
        </span>
      );
    case "approved":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
          Approved
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
          Rejected
        </span>
      );
    default:
      return null;
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

export const PaymentRequestsSection: React.FC = () => {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Screenshot lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Confirmation dialog
  const [confirmAction, setConfirmAction] = useState<{
    requestId: string;
    action: "approved" | "rejected";
    username: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Fetch Data ──────────────────────────────────────────────────────

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (statusFilter !== "all") params.status = statusFilter;
      const data = await paymentService.getPaymentRequests(params);
      setRequests(data.requests);
      setCounts(data.counts);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch payment requests:", error);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // ── Actions ─────────────────────────────────────────────────────────

  const handleStatusUpdate = async (requestId: string, status: "approved" | "rejected") => {
    setActionLoading(requestId);
    try {
      await paymentService.updatePaymentStatus(requestId, status);
      // Update local state
      setRequests((prev) =>
        prev.map((r) =>
          r._id === requestId
            ? { ...r, status, reviewedAt: new Date().toISOString() }
            : r
        )
      );
      // Update counts
      setCounts((prev) => ({
        ...prev,
        pending: Math.max(0, prev.pending - 1),
        [status]: prev[status] + 1,
      }));
    } catch (error) {
      console.error("Failed to update payment status:", error);
    } finally {
      setActionLoading(null);
      setConfirmAction(null);
    }
  };

  // ── Skeleton Loader ─────────────────────────────────────────────────

  const renderSkeleton = () =>
    Array.from({ length: 4 }).map((_, i) => (
      <tr key={i} className="border-b border-light-border dark:border-white/[0.04]">
        <td colSpan={7} className="px-6 py-5">
          <div className="h-5 bg-light-border dark:bg-white/[0.06] rounded animate-pulse w-full" />
        </td>
      </tr>
    ));

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-light-text dark:text-white tracking-tight flex items-center gap-3">
            Payment Requests
            {counts.pending > 0 && (
              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold">
                {counts.pending} pending
              </span>
            )}
          </h1>
          <p className="mt-1 text-sm font-semibold text-light-text/50 dark:text-white/40">
            Review and approve InstaPay payment submissions
          </p>
        </div>
        <button
          onClick={fetchRequests}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2.5 bg-light-primary/5 dark:bg-dark-primary/10 border border-light-primary/20 dark:border-dark-primary/20 text-light-primary dark:text-dark-primary font-bold rounded-xl hover:bg-light-primary/10 dark:hover:bg-dark-primary/15 active:scale-[0.98] transition-all text-xs self-start"
        >
          <Icon name="refresh" className={`text-base ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-light-bg dark:bg-[#121214] p-1 rounded-xl border border-light-border dark:border-white/5 shadow-inner w-max">
        {STATUS_TABS.map((tab) => {
          const count = tab.id === "all" ? counts.all : counts[tab.id];
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors ${
                isActive
                  ? "text-light-primary dark:text-white bg-white dark:bg-white/10 shadow-sm border border-light-border dark:border-white/10"
                  : "text-light-text/50 dark:text-white/50 bg-transparent hover:text-light-text border border-transparent"
              }`}
            >
              <span className="material-symbols-rounded text-[16px]">{tab.icon}</span>
              {tab.label}
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isActive
                    ? "bg-light-primary/10 dark:bg-dark-primary/20 text-light-primary dark:text-dark-primary"
                    : "bg-black/5 dark:bg-white/5 text-light-text/40 dark:text-white/30"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-[#1A1A1E] border border-light-border dark:border-white/[0.06] rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-light-border dark:border-white/[0.06] bg-light-surface/50 dark:bg-white/[0.02]">
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-light-text/40 dark:text-white/30">
                  User
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-light-text/40 dark:text-white/30">
                  Plan
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-light-text/40 dark:text-white/30">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-light-text/40 dark:text-white/30">
                  Details
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-light-text/40 dark:text-white/30">
                  Screenshot
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-light-text/40 dark:text-white/30">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-light-text/40 dark:text-white/30">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                renderSkeleton()
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <span className="material-symbols-rounded text-4xl text-light-text/20 dark:text-white/10 block mb-2">
                      payments
                    </span>
                    <p className="text-sm text-light-text/40 dark:text-white/30 font-medium">
                      No payment requests{statusFilter !== "all" ? ` with status "${statusFilter}"` : ""}
                    </p>
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr
                    key={req._id}
                    className="border-b border-light-border dark:border-white/[0.04] hover:bg-light-surface dark:hover:bg-white/[0.02] transition-colors"
                  >
                    {/* User */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-light-primary/10 dark:bg-dark-primary/15 flex items-center justify-center shrink-0 overflow-hidden">
                          {req.avatar ? (
                            <img src={req.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-black text-light-primary dark:text-dark-primary">
                              {req.username?.charAt(0).toUpperCase() || "?"}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-light-text dark:text-white truncate">
                            {req.username}
                          </p>
                          <p className="text-[11px] text-light-text/40 dark:text-white/30 truncate">
                            {req.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Plan */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-light-text dark:text-white">
                          {PLAN_LABELS[req.planId] || req.planId}
                        </p>
                        <span className="text-[10px] font-bold text-light-text/40 dark:text-white/30 uppercase">
                          {req.billingCycle}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-extrabold text-light-primary dark:text-dark-primary">
                        {req.amount.toLocaleString()} EGP
                      </span>
                    </td>

                    {/* Details (Name + Phone) */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs font-semibold text-light-text dark:text-white">
                          {req.senderName}
                        </p>
                        <p className="text-[11px] font-mono text-light-text/50 dark:text-white/40">
                          {req.phoneNumber}
                        </p>
                      </div>
                    </td>

                    {/* Screenshot */}
                    <td className="px-6 py-4">
                      {req.screenshotUrl ? (
                        <button
                          onClick={() => setLightboxUrl(req.screenshotUrl)}
                          className="w-12 h-12 rounded-lg border border-light-border dark:border-white/10 overflow-hidden hover:ring-2 hover:ring-light-primary/30 dark:hover:ring-dark-primary/30 transition-all cursor-pointer group"
                        >
                          <img
                            src={req.screenshotUrl}
                            alt="Payment screenshot"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        </button>
                      ) : (
                        <span className="text-[11px] text-light-text/30 dark:text-white/20 font-medium italic">
                          No image
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <div>
                        {getStatusBadge(req.status)}
                        <p className="text-[10px] text-light-text/40 dark:text-white/25 mt-1">
                          {timeAgo(req.createdAt)}
                        </p>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      {req.status === "pending" ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              setConfirmAction({
                                requestId: req._id,
                                action: "approved",
                                username: req.username,
                              })
                            }
                            disabled={actionLoading === req._id}
                            className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-600 dark:text-green-400 font-bold text-xs rounded-lg transition-all active:scale-[0.95] disabled:opacity-50"
                          >
                            <span className="material-symbols-rounded text-[16px]">check</span>
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              setConfirmAction({
                                requestId: req._id,
                                action: "rejected",
                                username: req.username,
                              })
                            }
                            disabled={actionLoading === req._id}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-xs rounded-lg transition-all active:scale-[0.95] disabled:opacity-50"
                          >
                            <span className="material-symbols-rounded text-[16px]">close</span>
                            Reject
                          </button>
                        </div>
                      ) : (
                        <p className="text-[11px] text-light-text/40 dark:text-white/25 text-right font-medium">
                          {req.reviewedAt ? `Reviewed ${timeAgo(req.reviewedAt)}` : "—"}
                        </p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-light-border dark:border-white/[0.06]">
            <span className="text-xs font-bold text-light-text/40 dark:text-white/30">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-light-border dark:border-white/10 text-xs font-bold text-light-text dark:text-white disabled:opacity-30 hover:bg-light-bg dark:hover:bg-white/5 transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-light-border dark:border-white/10 text-xs font-bold text-light-text dark:text-white disabled:opacity-30 hover:bg-light-bg dark:hover:bg-white/5 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Screenshot Lightbox Modal ──────────────────────────────────── */}
      {lightboxUrl && createPortal(
        <div
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div
            className="relative max-w-3xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <span className="material-symbols-rounded text-[20px]">close</span>
            </button>
            <img
              src={lightboxUrl}
              alt="Payment screenshot — full view"
              className="max-w-full max-h-[85vh] object-contain bg-white dark:bg-[#1A1A1E]"
            />
          </div>
        </div>,
        document.body
      )}

      {/* ── Confirm Action Dialog ──────────────────────────────────────── */}
      {confirmAction && createPortal(
        <div
          className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setConfirmAction(null)}
        >
          <div
            className="bg-white dark:bg-dark-surface border border-light-border dark:border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  confirmAction.action === "approved"
                    ? "bg-green-500/10"
                    : "bg-red-500/10"
                }`}
              >
                <span
                  className={`material-symbols-rounded text-[22px] ${
                    confirmAction.action === "approved"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {confirmAction.action === "approved" ? "check_circle" : "cancel"}
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-light-text dark:text-white">
                  {confirmAction.action === "approved" ? "Approve" : "Reject"} Payment?
                </h3>
                <p className="text-xs text-light-text/50 dark:text-white/40">
                  For user <span className="font-bold">@{confirmAction.username}</span>
                </p>
              </div>
            </div>

            <p className="text-sm text-light-text/70 dark:text-dark-text/70 mb-6">
              {confirmAction.action === "approved"
                ? "This will activate the user's subscription plan."
                : "This will reject the payment. The user can submit a new request."}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2.5 border border-light-border dark:border-white/10 rounded-xl text-sm font-bold text-light-text dark:text-white hover:bg-light-bg dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleStatusUpdate(confirmAction.requestId, confirmAction.action)
                }
                disabled={!!actionLoading}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 ${
                  confirmAction.action === "approved"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {actionLoading ? (
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  confirmAction.action === "approved" ? "Approve" : "Reject"
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
