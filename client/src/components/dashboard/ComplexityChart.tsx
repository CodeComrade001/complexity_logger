/* eslint-disable @typescript-eslint/no-explicit-any */
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import type { complexityChart } from "../../types/complexityChartInterface";


export function ComplexityChart({ chartData: data }: complexityChart) {
  const getColor = (risk: string) => {
    switch (risk) {
      case "Low": return "var(--chart-2)"; // Greenish
      case "Medium": return "var(--chart-3)"; // Yellowish
      case "High": return "var(--chart-4)"; // Orangeish
      case "Critical": return "var(--destructive)"; // Red
      default: return "var(--muted)";
    }
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: any) => `${value}`}
        />
        <Tooltip
          cursor={{ fill: 'transparent' }}
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow-lg)"
          }}
          itemStyle={{ color: "hsl(var(--foreground))" }}
          labelStyle={{ color: "hsl(var(--muted-foreground))" }}
        />
        <Bar dataKey="complexity" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getColor(entry.risk)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}