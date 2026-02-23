"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { AlgorithmMetrics } from "@/types/graph";

interface Props {
  metrics: AlgorithmMetrics[];
}

export function MetricsChart({ metrics }: Props) {
  const chartData = [
    {
      metric: "Steps",
      ...Object.fromEntries(metrics.map((m) => [m.algorithmName, m.stepsCount])),
    },
    {
      metric: "Visited Nodes",
      ...Object.fromEntries(metrics.map((m) => [m.algorithmName, m.visitedNodes])),
    },
    {
      metric: "Path Length",
      ...Object.fromEntries(metrics.map((m) => [m.algorithmName, m.pathLength ?? 0])),
    },
  ];

  const colors = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444"];
  const algNames = metrics.map((m) => m.algorithmName);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="metric" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
          <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: "8px",
              color: "#e4e4e7",
            }}
          />
          <Legend wrapperStyle={{ color: "#a1a1aa" }} />
          {algNames.map((name, i) => (
            <Bar key={name} dataKey={name} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
