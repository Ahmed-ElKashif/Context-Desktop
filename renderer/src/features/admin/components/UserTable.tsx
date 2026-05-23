/**
 * UserTable.tsx
 * Sortable user management table.
 * Delegates row rendering to UserTableRow.
 * Sort state lives in the URL via the hook, passed down as props.
 */

import React from "react";
import { AdminUser } from "../api/adminService";
import UserTableRow from "./UserTableRow";

interface UserTableProps {
  users: AdminUser[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (column: string) => void;
  onToggleSuspend: (userId: string, currentlySuspended: boolean) => void;
  suspendStatus: Record<string, "loading" | "done">;
  isLoading: boolean;
}

const COLUMNS = [
  { key: "fullName",            label: "User",          hiddenBelow: "" },
  { key: "role",                label: "Role",          hiddenBelow: "sm" },
  { key: "subscriptionStatus",  label: "Status",        hiddenBelow: "md" },
  { key: "storageUsedBytes",    label: "Storage",       hiddenBelow: "lg" },
  { key: "createdAt",           label: "Joined",        hiddenBelow: "lg" },
  { key: "__actions",           label: "",              hiddenBelow: "" },
];

const SortIcon: React.FC<{ column: string; sortBy: string; sortOrder: "asc" | "desc" }> = ({
  column, sortBy, sortOrder,
}) => {
  if (column === "__actions") return null;
  const active = sortBy === column;
  return (
    <span className={`material-symbols-rounded text-[13px] transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-40"}`}>
      {active && sortOrder === "asc" ? "arrow_upward" : "arrow_downward"}
    </span>
  );
};

const SkeletonRow = () => (
  <tr className="border-b border-light-border dark:border-white/[0.04]">
    {[140, 60, 70, 60, 80, 80].map((w, i) => (
      <td key={i} className="px-4 py-3">
        <div className={`h-4 bg-light-border dark:bg-white/[0.06] rounded animate-pulse`} style={{ width: w }} />
      </td>
    ))}
  </tr>
);

const UserTable: React.FC<UserTableProps> = ({
  users,
  sortBy,
  sortOrder,
  onSort,
  onToggleSuspend,
  suspendStatus,
  isLoading,
}) => {
  return (
    <div className="bg-white dark:bg-[#1A1A1E] border border-light-border dark:border-white/[0.06] rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-light-border dark:border-white/[0.06] bg-light-surface/50 dark:bg-white/[0.02]">
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => col.key !== "__actions" && onSort(col.key)}
                  className={`px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-light-text/40 dark:text-white/30 select-none group ${
                    col.key !== "__actions" ? "cursor-pointer hover:text-light-text dark:hover:text-white transition-colors" : ""
                  } ${
                    col.hiddenBelow === "sm" ? "hidden sm:table-cell" :
                    col.hiddenBelow === "md" ? "hidden md:table-cell" :
                    col.hiddenBelow === "lg" ? "hidden lg:table-cell" : ""
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <SortIcon column={col.key} sortBy={sortBy} sortOrder={sortOrder} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <span className="material-symbols-rounded text-4xl text-light-text/20 dark:text-white/10 block mb-2">
                    person_search
                  </span>
                  <p className="text-sm text-light-text/40 dark:text-white/30 font-medium">No users found</p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserTableRow
                  key={user._id}
                  user={user}
                  onToggleSuspend={onToggleSuspend}
                  suspendLoading={suspendStatus[user._id] === "loading"}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;