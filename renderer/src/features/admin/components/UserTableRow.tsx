/**
 * UserTableRow.tsx
 * Renders a single user row inside UserTable.
 * Handles suspend/unsuspend with per-row loading state.
 */

import React from "react";
import { AdminUser } from "../api/adminService";

interface UserTableRowProps {
  user: AdminUser;
  onToggleSuspend: (userId: string, currentlySuspended: boolean) => void;
  suspendLoading: boolean;
}

const formatBytes = (bytes: number): string => {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(0)} MB`;
  return `${(bytes / 1e3).toFixed(0)} KB`;
};

const StatusBadge: React.FC<{ status: AdminUser["subscriptionStatus"] }> = ({ status }) => {
  const map = {
    active:   "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
    trial:    "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20",
    canceled: "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 border-red-100 dark:border-red-500/20",
    none:     "bg-light-border/50 dark:bg-white/5 text-light-text/40 dark:text-white/30 border-light-border dark:border-white/10",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${map[status]}`}>
      {status}
    </span>
  );
};

const RoleBadge: React.FC<{ role: AdminUser["role"] }> = ({ role }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
    role === "admin"
      ? "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-500/20"
      : "bg-light-border/40 dark:bg-white/5 text-light-text/50 dark:text-white/30 border-light-border dark:border-white/10"
  }`}>
    {role}
  </span>
);

const UserTableRow: React.FC<UserTableRowProps> = ({ user, onToggleSuspend, suspendLoading }) => {
  const nameForInitials = user.fullName || user.username || user.email || '??'
  const initials = nameForInitials
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <tr className={`border-b border-light-border dark:border-white/[0.04] hover:bg-light-surface dark:hover:bg-white/[0.02] transition-colors group ${
      user.isSuspended ? "opacity-60" : ""
    }`}>
      {/* User */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-light-primary/10 dark:bg-dark-primary/15 flex items-center justify-center shrink-0 text-xs font-black text-light-primary dark:text-dark-primary">
            {user.avatar ? (
              <img src={user.avatar} alt={initials} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-light-text dark:text-white truncate">
              {user.fullName ?? user.username}
              {user.isSuspended && (
                <span className="ml-2 text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wider">
                  suspended
                </span>
              )}
            </p>
            <p className="text-[11px] text-light-text/40 dark:text-white/30 truncate">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-4 py-3 hidden sm:table-cell">
        <RoleBadge role={user.role} />
      </td>

      {/* Status */}
      <td className="px-4 py-3 hidden md:table-cell">
        <StatusBadge status={user.subscriptionStatus} />
      </td>

      {/* Storage */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-xs font-medium text-light-text/60 dark:text-white/40">
          {formatBytes(user.storageUsedBytes)}
        </span>
      </td>

      {/* Joined */}
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-xs text-light-text/40 dark:text-white/30">
          {new Date(user.createdAt).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
          })}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onToggleSuspend(user._id, !!user.isSuspended)}
          disabled={suspendLoading || user.role === "admin"}
          title={user.role === "admin" ? "Cannot suspend an admin" : user.isSuspended ? "Unsuspend user" : "Suspend user"}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all disabled:opacity-30 disabled:cursor-not-allowed focus-ring-standard ${
            user.isSuspended
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20 hover:bg-emerald-100 dark:hover:bg-emerald-500/20"
              : "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20"
          }`}
        >
          {suspendLoading ? (
            <span className="material-symbols-rounded text-[14px] animate-spin">progress_activity</span>
          ) : (
            <span className="material-symbols-rounded text-[14px]">
              {user.isSuspended ? "lock_open" : "block"}
            </span>
          )}
          {user.isSuspended ? "Unsuspend" : "Suspend"}
        </button>
      </td>
    </tr>
  );
};

export default UserTableRow;