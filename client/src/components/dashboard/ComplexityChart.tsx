/* eslint-disable @typescript-eslint/no-explicit-any */
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";

const data = [
  { name: "auth.ts", complexity: 12, risk: "Low" },
  { name: "utils.ts", complexity: 5, risk: "Low" },
  { name: "parser.ts", complexity: 45, risk: "High" },
  { name: "graph.ts", complexity: 28, risk: "Medium" },
  { name: "api.ts", complexity: 8, risk: "Low" },
  { name: "legacy.js", complexity: 85, risk: "Critical" },
  { name: "user.ts", complexity: 15, risk: "Low" },
];

export function ComplexityChart() {
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