import {
  PieChart, Pie, Cell,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { CHART_COLORS, DarkTooltipStyle, formatDateTick } from "./chartTypes";

export interface PieSlice {
  name:     string;
  value:    number;
  rawValue: string;
}

interface PieChartViewProps {
  pieData:  PieSlice[];
  yAxisKey: string;
  yIsDate:  boolean;
}

export const PieChartView = ({ pieData, yAxisKey, yIsDate }: PieChartViewProps) => (
  <ResponsiveContainer width="100%" height="100%">
    <PieChart>
      <Pie
        data={pieData}
        cx="50%"
        cy="50%"
        innerRadius="35%"
        outerRadius="60%"
        paddingAngle={3}
        dataKey="value"
      >
        {pieData.map((_, i) => (
          <Cell key={`c-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
        ))}
      </Pie>
      <Tooltip
        contentStyle={DarkTooltipStyle}
        formatter={(_v: any /* eslint-disable-line @typescript-eslint/no-explicit-any */, _name: any /* eslint-disable-line @typescript-eslint/no-explicit-any */, props: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => [
          yIsDate
            ? formatDateTick(props.payload.value)   // show readable date
            : props.payload.value.toLocaleString(), // show formatted number
          yAxisKey,
        ]}
      />
      <Legend
        iconType="circle"
        wrapperStyle={{ fontSize: 11, paddingTop: 16 }}
        formatter={(v) => String(v).slice(0, 24)}
      />
    </PieChart>
  </ResponsiveContainer>
);
