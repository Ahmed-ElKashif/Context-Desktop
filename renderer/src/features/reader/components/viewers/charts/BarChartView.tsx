import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { ACCENT, DarkTooltipStyle, TickStyle, formatDateTick } from "./chartTypes";

interface BarChartViewProps {
  chartData: Record<string, string | number>[];
  xAxisKey:  string;
  yAxisKey:  string;
  yIsDate:   boolean;
}

export const BarChartView = ({ chartData, xAxisKey, yAxisKey, yIsDate }: BarChartViewProps) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
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
        cursor={{ fill: "rgba(255,255,255,0.03)" }}
        formatter={(v: any) => [yIsDate ? formatDateTick(v as number) : v.toLocaleString(), yAxisKey]}
      />
      <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
      <Bar dataKey={yAxisKey} fill={ACCENT} radius={[5, 5, 0, 0]} maxBarSize={56} />
    </BarChart>
  </ResponsiveContainer>
);
