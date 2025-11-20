"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type CategoryChartProps = {
  data: Array<{
    category: string;
    mastered: number;
    total: number;
  }>;
};

export function CategoryChart({ data }: CategoryChartProps) {
  const chartData = data.map((entry) => ({
    category: entry.category,
    percent: entry.total === 0 ? 0 : Math.round((entry.mastered / entry.total) * 100),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="category"
          stroke="#94a3b8"
          tickLine={false}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          tick={{ fontSize: 12, fill: "#cbd5f5" }}
        />
        <YAxis
          stroke="#94a3b8"
          tickFormatter={(value) => `${value}%`}
          domain={[0, 100]}
          tickLine={false}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          tick={{ fontSize: 12, fill: "#cbd5f5" }}
        />
        <Tooltip
          cursor={{ fill: "rgba(148,163,184,0.15)" }}
          contentStyle={{
            backgroundColor: "rgba(15,23,42,0.9)",
            border: "1px solid rgba(148,163,184,0.3)",
          }}
          labelStyle={{ color: "#e2e8f0" }}
          formatter={(value: number) => [`${value}%`, "Completion"]}
        />
        <Bar
          dataKey="percent"
          fill="url(#gradient)"
          radius={[14, 14, 0, 0]}
          background={{ fill: "rgba(15,23,42,0.5)", radius: [14, 14, 0, 0] }}
        />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgb(6,182,212)" />
            <stop offset="100%" stopColor="rgb(147,51,234)" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}

