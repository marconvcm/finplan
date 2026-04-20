"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function CashflowChart({ data }: { data: Array<{ label: string; income: number; expense: number }> }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="income" fill="#22c55e" radius={4} />
          <Bar dataKey="expense" fill="#ef4444" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
