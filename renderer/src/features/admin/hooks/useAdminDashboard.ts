/**
 * useAdminDashboard.ts
 * Custom hook that wires together:
 *  - Redux admin state (stats, users, pagination, loading flags)
 *  - URL search params (search, page, sortBy, sortOrder) via react-router-dom
 *
 * URL is the single source of truth for filters. Redux state is derived from it.
 */

import { useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchAdminStats,
  fetchAdminUsers,
  toggleSuspendUser,
  setSearch,
  setPage,
  setSort,
} from "../../../store/adminSlice";
import { adminService } from "../api/adminService";

export const useAdminDashboard = () => {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Read URL params ────────────────────────────────────────────────────────
  const search = searchParams.get("search") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const sortBy = searchParams.get("sortBy") ?? "createdAt";
  const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";

  // ── Redux state ────────────────────────────────────────────────────────────
  const stats = useAppSelector((s) => s.admin.stats);
  const users = useAppSelector((s) => s.admin.users);
  const pagination = useAppSelector((s) => s.admin.pagination);
  const statsStatus = useAppSelector((s) => s.admin.statsStatus);
  const usersStatus = useAppSelector((s) => s.admin.usersStatus);
  const suspendStatus = useAppSelector((s) => s.admin.suspendStatus);

  // ── Fetch stats once on mount — guard against StrictMode double-invoke ───────
  useEffect(() => {
    if (statsStatus === "idle") {
      dispatch(fetchAdminStats());
    }
  }, [dispatch]); // intentionally omit statsStatus — only run on mount

  // ── Sync URL params → Redux → API on every URL change ─────────────────────
  useEffect(() => {
    dispatch(setSearch(search));
    dispatch(setPage(page));
    dispatch(setSort({ sortBy, sortOrder }));
    dispatch(fetchAdminUsers({ search, page, limit: 10, sortBy, sortOrder }));
  }, [dispatch, search, page, sortBy, sortOrder]);

  // ── URL param setters (these drive everything) ─────────────────────────────
  const handleSearch = useCallback(
    (value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set("search", value);
        else next.delete("search");
        next.set("page", "1"); // reset page on new search
        return next;
      });
    },
    [setSearchParams],
  );

  const handlePage = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("page", String(newPage));
        return next;
      });
    },
    [setSearchParams],
  );

  const handleSort = useCallback(
    (column: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        const currentSort = prev.get("sortBy");
        const currentOrder = prev.get("sortOrder") ?? "desc";
        if (currentSort === column) {
          next.set("sortOrder", currentOrder === "desc" ? "asc" : "desc");
        } else {
          next.set("sortBy", column);
          next.set("sortOrder", "desc");
        }
        return next;
      });
    },
    [setSearchParams],
  );

  const handleToggleSuspend = useCallback(
    (userId: string, currentlySuspended: boolean) => {
      dispatch(toggleSuspendUser({ userId, suspend: !currentlySuspended }));
    },
    [dispatch],
  );

  const handleExportCSV = useCallback(() => {
    adminService.exportUsersCSV();
  }, []);

  return {
    // Data
    stats,
    users,
    pagination,
    // URL-derived filter state
    search,
    page,
    sortBy,
    sortOrder,
    // Loading
    isStatsLoading: statsStatus === "loading" || statsStatus === "idle",
    isUsersLoading: usersStatus === "loading" || usersStatus === "idle",
    suspendStatus,
    // Actions
    handleSearch,
    handlePage,
    handleSort,
    handleToggleSuspend,
    handleExportCSV,
  };
};
