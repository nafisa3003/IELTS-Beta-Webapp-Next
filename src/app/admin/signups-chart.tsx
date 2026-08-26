"use client";

import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from "recharts";

export function SignupsChart({ data }: { data: { day: string; count: number }[] }) {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "var(--slate-soft)" }} />
          <Tooltip
            cursor={{ fill: "var(--mist)" }}
            contentStyle={{ borderRadius: 8, borderColor: "var(--mist)", fontSize: 12 }}
          />
          <Bar dataKey="count" fill="var(--teal)" radius={[6, 6, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
