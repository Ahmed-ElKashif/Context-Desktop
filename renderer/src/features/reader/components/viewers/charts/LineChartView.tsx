import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { CHART_COLORS, DarkTooltipStyle, TickStyle, formatDateTick } from "./chartTypes";

interface LineChartViewProps {
  chartData: Record<string, string | number>[];
  xAxisKey:  string;
  yAxisKey:  string;
  yIsDate:   boolean;
}

export const LineChartView = ({ chartData, xAxisKey, yAxisKey, yIsDate }: LineChartViewProps) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
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
      <Line
        type="monotone"
        dataKey={yAxisKey}
        stroke={CHART_COLORS[1]}
        strokeWidth={2.5}
        dot={{ r: 3.5, fill: CHART_COLORS[1], strokeWidth: 0 }}
        activeDot={{ r: 6, strokeWidth: 0 }}
      />
    </LineChart>
  </ResponsiveContainer>
);
