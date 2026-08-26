import { ListeningIcon, ReadingIcon, WritingIcon, SpeakingIcon } from "@/components/icons/stat-icons";
import type { Skill } from "@/types/assessment";

const MAX_BAND = 9;

const SKILL_META: Record<Skill, { icon: typeof ListeningIcon; color: string }> = {
  Listening: { icon: ListeningIcon, color: "var(--teal)" },
  Reading: { icon: ReadingIcon, color: "var(--navy)" },
  Writing: { icon: WritingIcon, color: "var(--xp)" },
  Speaking: { icon: SpeakingIcon, color: "var(--violet)" },
};

export function SkillProgress({ bands }: { bands: Partial<Record<Skill, number>> }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {(Object.keys(SKILL_META) as Skill[]).map((skill) => {
        const { icon: Icon, color } = SKILL_META[skill];
        const band = bands[skill] ?? 0;
        const pct = Math.min(100, Math.round((band / MAX_BAND) * 100));
        const hasScore = band > 0;

        return (
          <div
            key={skill}
            className="group relative overflow-hidden rounded-2xl border border-mist bg-surface p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate/20 dark:bg-navy-deep"
          >
            {/* Top accent line */}
            <div
              className="absolute left-0 right-0 top-0 h-1 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
              style={{ backgroundColor: color }}
            />

            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: `${color}18` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink leading-tight dark:text-white">
                    {skill}
                  </p>
                  <p className="text-xs text-slate mt-0.5 font-medium dark:text-slate-soft">
                    Band score
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className="text-2xl font-bold tracking-tight tabular-nums"
                  style={{ color: hasScore ? color : "var(--slate)" }}
                >
                  {hasScore ? band.toFixed(1) : "—"}
                </span>
                {hasScore && (
                  <span className="ml-1 text-xs font-semibold text-slate dark:text-slate-soft">
                    /{MAX_BAND}
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate dark:text-slate-soft">
                  {hasScore ? `${pct}% proficiency` : "Not assessed"}
                </span>
                <span className="font-semibold text-slate tabular-nums dark:text-slate-soft">
                  {hasScore ? `${band.toFixed(1)}` : "0.0"}
                </span>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-mist ring-1 ring-slate/5 dark:bg-slate/10 dark:ring-white/5">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: hasScore ? `${pct}%` : "0%",
                    backgroundColor: color,
                    boxShadow: hasScore ? `0 0 12px ${color}40` : "none",
                  }}
                />
              </div>

              {/* Milestone markers */}
              <div className="relative h-3 w-full">
                {[3, 6, 9].map((milestone) => (
                  <div
                    key={milestone}
                    className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
                    style={{ left: `${(milestone / MAX_BAND) * 100}%` }}
                  >
                    <div
                      className={`h-1 w-px transition-colors ${
                        hasScore && band >= milestone
                          ? "bg-slate dark:bg-slate-soft"
                          : "bg-mist dark:bg-slate/20"
                      }`}
                    />
                    <span
                      className={`text-[10px] font-medium mt-0.5 ${
                        hasScore && band >= milestone
                          ? "text-slate dark:text-slate-soft"
                          : "text-slate/40 dark:text-slate/30"
                      }`}
                    >
                      {milestone}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}