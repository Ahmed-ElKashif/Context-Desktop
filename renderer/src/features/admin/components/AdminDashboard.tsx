/**
 * AdminDashboard.tsx
 * Main layout for the admin panel.
 * Composes AdminSidebar, KPICard, TrafficChart, DocumentDistributionChart, UserTable, SearchAndPagination.
 */

import React, { useState, useEffect } from "react";
import { useAdminDashboard } from "../hooks/useAdminDashboard";
import { AdminSidebar } from "./AdminSidebar";
import { KPICard } from "./KPICard";
import { TrafficChart, DocumentDistributionChart, DailyTrafficChart } from "./AdminCharts";
import UserTable from "./UserTable";
import SearchAndPagination from "./SearchAndPagination";
import { AIUsageSection } from "./AIUsageSection";
import { api } from "../../../lib/axios";
import { Icon } from "../../../components/ui/core/Icons";
import Settings from "../../../pages/settings";
import { ProfileFeature } from "../../profile/ProfileFeature";
import { PaymentRequestsSection } from "./PaymentRequestsSection";

const AdminDashboard: React.FC = () => {
  const {
    stats,
    users,
    pagination,
    search,
    page,
    sortBy,
    sortOrder,
    isStatsLoading,
    isUsersLoading,
    suspendStatus,
    handleSearch,
    handlePage,
    handleSort,
    handleToggleSuspend,
    handleExportCSV,
  } = useAdminDashboard();

  // Active tab state
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "top-ai" | "ai" | "profile" | "settings" | "payments">("dashboard");

  // AI Usage state for top-ai and charts
  const [aiUsage, setAIUsage] = useState<any>(null);
  const [isAIUsageLoading, setIsAIUsageLoading] = useState(true);

  useEffect(() => {
    const fetchAIUsage = async () => {
      try {
        const res = await api.get("/admin/ai-usage");
        setAIUsage(res.data.data);
      } catch (error) {
        console.error("Failed to fetch AI usage:", error);
      } finally {
        setIsAIUsageLoading(false);
      }
    };
    fetchAIUsage();
  }, [activeTab]);

  const formatBytes = (bytes: number) => {
    if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(1)} TB`;
    if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
    return `${(bytes / 1e6).toFixed(0)} MB`;
  };

  const formatTokens = (tokens: number) => {
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
    if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
    return tokens.toLocaleString();
  };

  // Client-side Top AI Users CSV Export
  const handleExportTopAIUsersCSV = () => {
    if (!aiUsage?.topUsers) return;
    const header = "Rank,Username,Email,Tokens Used,Requests Count\n";
    const rows = aiUsage.topUsers.map((user: any, idx: number) => 
      [
        idx + 1,
        user.username,
        user.email,
        user.tokensUsed,
        user.requestCount
      ].join(",")
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `top-ai-users-export-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-light-bg dark:bg-[#09090b] overflow-hidden">
      
      {/* ── Admin Sidebar ─────────────────────────────────────────────────── */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ── Main Content Container ────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-10">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Conditional Views */}
          {activeTab === "dashboard" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* Header Greeting (Mockup Style) */}
              <div>
                <h1 className="text-2xl font-black text-light-text dark:text-white tracking-tight">
                  Hi, Welcome back
                </h1>
                <p className="mt-1 text-sm font-semibold text-light-text/50 dark:text-white/40">
                  Platform overview and real-time statistics
                </p>
              </div>

              {/* Four Colored Metric Cards (Brand Colors Style) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard
                  title="Total Users"
                  value={stats?.totalUsers ?? 0}
                  icon="group"
                  theme="primary"
                  subtitle={`${stats?.activeUsers ?? 0} active users`}
                  isLoading={isStatsLoading}
                />
                <KPICard
                  title="Trial Users"
                  value={stats?.trialUsers ?? 0}
                  icon="hourglass_top"
                  theme="secondary"
                  subtitle={`${stats?.canceledUsers ?? 0} canceled`}
                  isLoading={isStatsLoading}
                />
                <KPICard
                  title="Storage Consumed"
                  value={formatBytes(stats?.totalStorageBytes ?? 0)}
                  icon="database"
                  theme="accent"
                  subtitle="Across all accounts"
                  isLoading={isStatsLoading}
                />
                <KPICard
                  title="Page Views"
                  value={stats?.totalPageViews ?? 0}
                  icon="bar_chart"
                  theme="slate"
                  subtitle={`${(stats?.totalUniqueVisitors ?? 0).toLocaleString()} visitors`}
                  isLoading={isStatsLoading}
                />
              </div>

              {/* Composed Chart + Pie Chart Grid (Mockup Layout) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <TrafficChart
                    data={stats?.trafficHistory ?? []}
                    isLoading={isStatsLoading}
                  />
                  <DailyTrafficChart
                    data={stats?.dailyTrafficHistory ?? []}
                    isLoading={isStatsLoading}
                  />
                </div>
                <div className="lg:col-span-1">
                  <DocumentDistributionChart
                    data={stats?.documentDistribution ?? []}
                    isLoading={isStatsLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-light-text dark:text-white tracking-tight">
                    User Management
                  </h1>
                  <p className="mt-1 text-sm font-semibold text-light-text/50 dark:text-white/40">
                    Manage accounts, view status, and suspend users
                  </p>
                </div>
                <button
                  onClick={handleExportCSV}
                  disabled={isUsersLoading || !users.length}
                  className="flex items-center gap-2 px-5 py-3 bg-light-primary dark:bg-dark-primary text-white dark:text-black font-extrabold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-xs shadow-sm self-start"
                >
                  <Icon name="download" className="text-base" />
                  <span>Export as CSV</span>
                </button>
              </div>

              {/* Search & Action bar */}
              <div className="bg-white dark:bg-[#1A1A1E] border border-light-border dark:border-white/[0.06] rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-extrabold text-light-text dark:text-white">
                    Accounts List
                  </h2>
                  <span className="text-xs font-bold text-light-text/40 dark:text-white/30">
                    {pagination.total.toLocaleString()} total accounts
                  </span>
                </div>

                <SearchAndPagination
                  search={search}
                  onSearch={handleSearch}
                  page={page}
                  totalPages={pagination.totalPages}
                  total={pagination.total}
                  onPage={handlePage}
                  isLoading={isUsersLoading}
                  hidePagination={true}
                />

                <UserTable
                  users={users}
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  onToggleSuspend={handleToggleSuspend}
                  suspendStatus={suspendStatus}
                  isLoading={isUsersLoading}
                />

                {/* Bottom Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-end pt-2 border-t border-light-border dark:border-white/5">
                    <SearchAndPagination
                      search={search}
                      onSearch={handleSearch}
                      page={page}
                      totalPages={pagination.totalPages}
                      total={pagination.total}
                      onPage={handlePage}
                      isLoading={isUsersLoading}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "top-ai" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-light-text dark:text-white tracking-tight">
                    Top AI Users
                  </h1>
                  <p className="mt-1 text-sm font-semibold text-light-text/50 dark:text-white/40">
                    Active users ranked by token consumption this month
                  </p>
                </div>
                <button
                  onClick={handleExportTopAIUsersCSV}
                  disabled={isAIUsageLoading || !aiUsage?.topUsers?.length}
                  className="flex items-center gap-2 px-5 py-3 bg-light-primary dark:bg-dark-primary text-white dark:text-black font-extrabold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all text-xs shadow-sm self-start"
                >
                  <Icon name="download" className="text-base" />
                  <span>Export as CSV</span>
                </button>
              </div>

              {/* Top AI Users Table Card */}
              <div className="bg-white dark:bg-[#1A1A1E] border border-light-border dark:border-white/[0.06] rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-light-border dark:border-white/[0.06] bg-light-surface/50 dark:bg-white/[0.02]">
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-light-text/40 dark:text-white/30">Rank</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-light-text/40 dark:text-white/30">User</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-light-text/40 dark:text-white/30">Tokens Used</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-light-text/40 dark:text-white/30">Requests</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isAIUsageLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                          <tr key={i} className="border-b border-light-border dark:border-white/[0.04]">
                            <td colSpan={4} className="px-6 py-4">
                              <div className="h-5 bg-light-border dark:bg-white/[0.06] rounded animate-pulse w-3/4" />
                            </td>
                          </tr>
                        ))
                      ) : !aiUsage?.topUsers?.length ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-16 text-center">
                            <span className="material-symbols-rounded text-4xl text-light-text/20 dark:text-white/10 block mb-2">
                              psychology_alt
                            </span>
                            <p className="text-sm text-light-text/40 dark:text-white/30 font-medium">No AI usage data available</p>
                          </td>
                        </tr>
                      ) : (
                        aiUsage.topUsers.map((user: any, index: number) => (
                          <tr key={user.userId} className="border-b border-light-border dark:border-white/[0.04] hover:bg-light-surface dark:hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-light-primary/5 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary text-xs font-black">
                                #{index + 1}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-bold text-light-text dark:text-white">{user.username}</p>
                                <p className="text-[11px] text-light-text/40 dark:text-white/30">{user.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-extrabold text-light-primary dark:text-dark-primary">
                                {formatTokens(user.tokensUsed)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs text-light-text/60 dark:text-white/40 font-medium">
                                {user.requestCount.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* Header */}
              <div>
                <h1 className="text-2xl font-black text-light-text dark:text-white tracking-tight">
                  AI Analytics
                </h1>
                <p className="mt-1 text-sm font-semibold text-light-text/50 dark:text-white/40">
                  Detailed AI tokens usage and model operations metrics
                </p>
              </div>

              <div className="bg-white dark:bg-[#1A1A1E] border border-light-border dark:border-white/[0.06] rounded-3xl p-6 shadow-sm">
                <AIUsageSection />
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 h-full -m-8 lg:-m-10">
              <Settings />
            </div>
          )}

          {activeTab === "profile" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 h-full -m-8 lg:-m-10">
              <ProfileFeature />
            </div>
          )}

          {activeTab === "payments" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <PaymentRequestsSection />
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;