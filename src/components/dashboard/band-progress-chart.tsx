"use client";

import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";

const MAX_BAND = 9;

export function BandProgressChart({
  currentBand,
  targetBand,
}: {
  currentBand: number | null;
  targetBand: number | null;
}) {
  const current = currentBand ?? 0;
  const target = targetBand ?? MAX_BAND;
  const progressPct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

  const data = [
    { name: "progress", value: current, fill: "var(--teal)" },
  ];

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative h-44 w-44">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="72%"
            outerRadius="100%"
            data={data}
            startAngle={90}
            endAngle={-270}
            barSize={14}
          >
            <PolarAngleAxis type="number" domain={[0, target]} angleAxisId={0} tick={false} />
            <RadialBar background={{ fill: "var(--mist)" }} dataKey="value" cornerRadius={999} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-bold text-navy dark:text-white">
            {current > 0 ? current.toFixed(1) : "—"}
          </span>
          <span className="text-xs font-medium text-slate-soft">of {target.toFixed(1)} target</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-semibold text-teal">{progressPct}% of the way there</p>
    </div>
  );
}
