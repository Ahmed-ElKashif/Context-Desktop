/**
 * AIUsageSection.tsx
 * Shows AI token consumption analytics in the admin dashboard.
 * - KPI card with total tokens used this month
 * - Daily usage chart (last 30 days)
 * - Monthly usage chart (last 6 months)
 */

import React, { useEffect, useState } from 'react'
import { api } from '../../../lib/axios'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'

interface AIUsageData {
  totalTokensThisMonth: number
  totalRequestsThisMonth: number
  topUsers: {
    userId: string
    username: string
    email: string
    tokensUsed: number
    requestCount: number
  }[]
  dailyUsage: {
    date: string
    tokensUsed: number
    requestCount: number
  }[]
  monthlyUsage: {
    month: string
    tokensUsed: number
    requestCount: number
  }[]
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
const CustomTooltip = ({
  active,
  payload,
  label,
  isMonthly = false
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  isMonthly?: boolean;
}) => {
  if (!active || !payload?.length) return null;
  
  let formattedLabel = label;
  if (isMonthly && typeof label === 'string' && label.includes('-')) {
    const [year, month] = label.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    formattedLabel = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  } else if (!isMonthly && label) {
    const date = new Date(label);
    if (!isNaN(date.getTime())) {
      formattedLabel = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    }
  }

  return (
    <div className="bg-white dark:bg-[#1E1E22] border border-light-border dark:border-white/10 rounded-xl shadow-xl p-3 text-xs font-semibold z-[100]">
      <p className="text-light-text/65 dark:text-white/45 font-bold uppercase tracking-wider mb-2">{formattedLabel}</p>
      {payload.map((entry) => {
        // Fallback to a solid color if Recharts passes the gradient URL
        const color = entry.color?.startsWith('url') ? '#8b5cf6' : entry.color;
        return (
          <p key={entry.name} style={{ color }} className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: color }} />
            {entry.name}: <span className="font-extrabold ml-1">{entry.value.toLocaleString()}</span>
          </p>
        );
      })}
    </div>
  );
};

export const AIUsageSection: React.FC = () => {
  const [data, setData] = useState<AIUsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAIUsage = async () => {
      try {
        const res = await api.get('/admin/ai-usage')
        setData(res.data.data)
      } catch (error) {
        console.error('Failed to fetch AI usage:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAIUsage()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-light-border/30 dark:bg-white/5 animate-pulse rounded-2xl" />
        <div className="h-64 bg-light-border/30 dark:bg-white/5 animate-pulse rounded-2xl" />
      </div>
    )
  }

  if (!data) return null

  const formatTokens = (tokens: number) => {
    if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`
    if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`
    return tokens.toLocaleString()
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* KPI Card */}
      <div className="bg-white dark:bg-[#1A1A1E] border border-light-border dark:border-white/[0.06] rounded-3xl p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-black text-light-text/50 dark:text-white/40 uppercase tracking-widest mb-2">
              AI Tokens This Month
            </p>
            <p className="text-3xl font-black text-light-text dark:text-white tracking-tight">
              {formatTokens(data.totalTokensThisMonth)}
            </p>
            <p className="text-xs text-light-text/40 dark:text-white/30 mt-1.5 font-bold">
              {data.totalRequestsThisMonth.toLocaleString()} AI requests
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <span className="material-symbols-rounded text-purple-500 text-xl">psychology</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Daily Usage Chart */}
        <div className="bg-white dark:bg-[#1A1A1E] border border-light-border dark:border-white/[0.06] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-extrabold text-light-text dark:text-white">Daily AI Usage</h3>
              <p className="text-[11px] font-semibold text-light-text/50 dark:text-white/40 mt-0.5">Token consumption over last 30 days</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.dailyUsage} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "rgba(128,128,128,0.6)", fontWeight: "600" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "rgba(128,128,128,0.6)", fontWeight: "600" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatTokens(v)}
              />
              <Tooltip content={<CustomTooltip isMonthly={false} />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8, fontWeight: "600" }} />
              <Line
                type="monotone"
                dataKey="tokensUsed"
                name="Tokens Used"
                stroke="#a855f7"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Usage Chart */}
        <div className="bg-white dark:bg-[#1A1A1E] border border-light-border dark:border-white/[0.06] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-extrabold text-light-text dark:text-white">Monthly AI Usage</h3>
              <p className="text-[11px] font-semibold text-light-text/50 dark:text-white/40 mt-0.5">Token consumption over last 6 months</p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.monthlyUsage} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="monthlyTokensGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.06)" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "rgba(128,128,128,0.6)", fontWeight: "600" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(m) => {
                  const [year, month] = m.split('-')
                  const date = new Date(parseInt(year), parseInt(month) - 1, 1)
                  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "rgba(128,128,128,0.6)", fontWeight: "600" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => formatTokens(v)}
              />
              <Tooltip
                cursor={{ fill: 'rgba(128,128,128,0.1)' }}
                content={<CustomTooltip isMonthly={true} />}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8, fontWeight: "600" }} />
              <Bar
                dataKey="tokensUsed"
                name="Tokens Used"
                fill="url(#monthlyTokensGrad)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}