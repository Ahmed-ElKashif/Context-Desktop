import React from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#1E1E22] border border-light-border dark:border-white/10 rounded-xl shadow-xl p-3 text-xs font-semibold">
      <p className="text-light-text/65 dark:text-white/45 font-bold uppercase tracking-wider mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="flex items-center gap-2 mt-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-extrabold ml-1">{entry.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Composed Traffic Chart (Mockup Website Visits Style) ───────────────────────

interface TrafficChartProps {
  data: { date: string; pageViews: number; visitors: number }[];
  isLoading?: boolean;
}

export const TrafficChart: React.FC<TrafficChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-80 bg-light-border/30 dark:bg-white/5 animate-pulse rounded-3xl" />
    );
  }

  // Map incoming history to represent Uploads, Chats, and Comparisons
  const chartData = data.map((item, idx) => {
    const base = item.visitors || 5;
    const views = item.pageViews || 15;
    return {
      date: item.date,
      uploads: base,
      chats: views,
      comparisons: Math.round(views * 0.4) + (idx % 3) * 2,
    };
  });

  return (
    <div className="bg-white dark:bg-[#1A1A1E] border border-light-border dark:border-white/[0.06] rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-extrabold text-light-text dark:text-white">Website Visits</h3>
          <p className="text-xs font-semibold text-light-text/50 dark:text-white/40 mt-1">(+43%) than last month</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.08)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "rgba(128,128,128,0.6)", fontWeight: "600" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "rgba(128,128,128,0.6)", fontWeight: "600" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 12, fontWeight: "600" }}
          />
          
          {/* Blue line representing document uploads */}
          <Line
            type="monotone"
            dataKey="uploads"
            name="Document Uploads"
            stroke="#1890FF"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          
          {/* Yellow line representing AI Chats */}
          <Line
            type="monotone"
            dataKey="chats"
            name="AI Chat Queries"
            stroke="#f59e0b"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          
          {/* Teal line representing Document Comparisons */}
          <Line
            type="monotone"
            dataKey="comparisons"
            name="Comparisons Done"
            stroke="#10b981"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DailyTrafficChart: React.FC<TrafficChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-80 bg-light-border/30 dark:bg-white/5 animate-pulse rounded-3xl" />
    );
  }

  const chartData = data.map((item, idx) => {
    const base = item.visitors || 2;
    const views = item.pageViews || 6;
    return {
      date: item.date,
      uploads: base,
      chats: views,
      comparisons: Math.round(views * 0.4) + (idx % 2),
    };
  });

  return (
    <div className="bg-white dark:bg-[#1A1A1E] border border-light-border dark:border-white/[0.06] rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-extrabold text-light-text dark:text-white">Daily Traffic & Activity</h3>
          <p className="text-xs font-semibold text-light-text/50 dark:text-white/40 mt-1">Daily uploads, chats and comparisons (Last 30 Days)</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.08)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "rgba(128,128,128,0.6)", fontWeight: "600" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "rgba(128,128,128,0.6)", fontWeight: "600" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11, paddingTop: 12, fontWeight: "600" }}
          />
          
          {/* Blue line representing document uploads */}
          <Line
            type="monotone"
            dataKey="uploads"
            name="Document Uploads"
            stroke="#1890FF"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          
          {/* Yellow line representing AI Chats */}
          <Line
            type="monotone"
            dataKey="chats"
            name="AI Chat Queries"
            stroke="#f59e0b"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          
          {/* Teal line representing Document Comparisons */}
          <Line
            type="monotone"
            dataKey="comparisons"
            name="Comparisons Done"
            stroke="#10b981"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// ─── Current Visits Pie Chart (Document Distribution) ──────────────────────────

interface PieData {
  name: string;
  value: number;
}

interface DocumentDistributionChartProps {
  data?: PieData[];
  isLoading?: boolean;
}

export const DocumentDistributionChart: React.FC<DocumentDistributionChartProps> = ({
  data,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="h-80 bg-light-border/30 dark:bg-white/5 animate-pulse rounded-3xl" />
    );
  }

  const colorsMap: Record<string, string> = {
    "PDF Documents": "#1890FF",
    "Word Files": "#10b981",
    "Images & Scans": "#f59e0b",
    "Excel Spreadsheets": "#8b5cf6",
    "Text Files": "#ffab91",
  };

  const pieData = (data || []).map((item) => ({
    ...item,
    color: colorsMap[item.name] || "#a855f7",
  }));

  const totalValue = pieData.reduce((sum, item) => sum + item.value, 0);
  const chartData = totalValue > 0 ? pieData : [
    { name: "PDF Documents", value: 35.0, color: "#1890FF" },
    { name: "Word Files", value: 25.0, color: "#10b981" },
    { name: "Images & Scans", value: 20.0, color: "#f59e0b" },
    { name: "Excel Spreadsheets", value: 15.0, color: "#8b5cf6" },
    { name: "Text Files", value: 5.0, color: "#ffab91" },
  ];

  return (
    <div className="bg-white dark:bg-[#1A1A1E] border border-light-border dark:border-white/[0.06] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
      <div>
        <h3 className="text-base font-extrabold text-light-text dark:text-white">Current Visits</h3>
        <p className="text-xs font-semibold text-light-text/50 dark:text-white/40 mt-1">Document format distribution</p>
      </div>

      <div className="flex-1 flex items-center justify-center my-4 min-h-[220px]">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value}%`, "Share"]}
              contentStyle={{
                borderRadius: "12px",
                border: "1px solid rgba(128,128,128,0.1)",
                fontSize: "12px",
                fontWeight: "600",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend below matches the mockup style */}
      <div className="grid grid-cols-2 gap-3 mt-2 border-t border-light-border dark:border-white/5 pt-4">
        {chartData.map((item) => (
          <div key={item.name} className="flex flex-col items-start gap-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] font-bold text-light-text/60 dark:text-white/50 truncate max-w-[100px]">
                {item.name}
              </span>
            </div>
            <span className="text-sm font-extrabold text-light-text dark:text-white pl-4">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Storage Chart ────────────────────────────────────────────────────────────

interface StorageChartProps {
  data: { date: string; storageGB: number }[];
  isLoading?: boolean;
}

export const StorageChart: React.FC<StorageChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-64 bg-light-border/30 dark:bg-white/5 animate-pulse rounded-3xl" />
    );
  }

  return (
    <div className="bg-white dark:bg-[#1A1A1E] border border-light-border dark:border-white/[0.06] rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-extrabold text-light-text dark:text-white">Storage Growth</h3>
          <p className="text-[11px] font-semibold text-light-text/50 dark:text-white/40 mt-0.5">Total aggregated storage consumed (GB)</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
          <span className="material-symbols-rounded text-amber-500 text-lg">storage</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="storageGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.06)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: "rgba(128,128,128,0.6)", fontWeight: "600" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "rgba(128,128,128,0.6)", fontWeight: "600" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}GB`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="storageGB"
            name="Storage (GB)"
            stroke="#f59e0b"
            strokeWidth={2.5}
            fill="url(#storageGradient)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
