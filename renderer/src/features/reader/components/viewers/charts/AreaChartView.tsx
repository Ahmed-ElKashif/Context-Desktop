import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { CHART_COLORS, DarkTooltipStyle, TickStyle, formatDateTick } from "./chartTypes";

interface AreaChartViewProps {
  chartData: Record<string, string | number>[];
  xAxisKey:  string;
  yAxisKey:  string;
  yIsDate:   boolean;
}

export const AreaChartView = ({ chartData, xAxisKey, yAxisKey, yIsDate }: AreaChartViewProps) => (
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%"  stopColor={CHART_COLORS[2]} stopOpacity={0.3} />
          <stop offset="95%" stopColor={CHART_COLORS[2]} stopOpacity={0}   />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
      <XAxis dataKey={xAxisKey} angle={-35} textAnchor="end" height={70} tick={TickStyle} />
      <YAxis
        tick={TickStyle}
        width={yIsDate ? 72 : 52}
        domain={["auto", "auto"]}
        tickFormatter={yIsDate ? formatDateTick : undefined}
      />
      <Tooltip
        contentStyle={DarkTooltipStyle}
        formatter={(v: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => [yIsDate ? formatDateTick(v as number) : v.toLocaleString(), yAxisKey]}
      />
      <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
      <Area
        type="monotone"
        dataKey={yAxisKey}
        stroke={CHART_COLORS[2]}
        strokeWidth={2.5}
        fill="url(#areaGrad)"
      />
    </AreaChart>
  </ResponsiveContainer>
);
