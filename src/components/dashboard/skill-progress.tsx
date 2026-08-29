"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  ListeningIcon,
  ReadingIcon,
  WritingIcon,
  SpeakingIcon,
} from "@/components/icons/stat-icons";
import type { Skill } from "@/types/assessment";

const MAX_BAND = 9;

const SKILL_META: Record<
  Skill,
  {
    icon: typeof ListeningIcon;
    color: string;
    gradient: string;
  }
> = {
  Listening: {
    icon: ListeningIcon,
    color: "var(--teal)",
    gradient: "from-teal to-cyan",
  },
  Reading: {
    icon: ReadingIcon,
    color: "var(--navy)",
    gradient: "from-navy to-blue-400",
  },
  Writing: {
    icon: WritingIcon,
    color: "var(--xp)",
    gradient: "from-xp to-amber-400",
  },
  Speaking: {
    icon: SpeakingIcon,
    color: "var(--violet)",
    gradient: "from-violet to-purple-400",
  },
};

export function SkillProgress({
  bands,
}: {
  bands: Partial<Record<Skill, number | null>>;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const isInView = useInView(ref, {
    once: true,
    margin: "-50px",
  });

  return (
    <div
      ref={ref}
      className="grid grid-cols-2 gap-4"
    >
      {(Object.keys(SKILL_META) as Skill[]).map(
        (skill, index) => {
          const {
            icon: Icon,
            color,
            gradient,
          } = SKILL_META[skill];

          const band = bands[skill] ?? 0;

          const pct = Math.min(
            100,
            Math.round(
              (band / MAX_BAND) * 100
            )
          );

          const hasScore = band > 0;

          return (
            <motion.div
              key={skill}
              initial={{
                opacity: 0,
                y: 20,
                scale: 0.95,
              }}
              animate={
                isInView
                  ? {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }
                  : {}
              }
              transition={{
                delay: index * 0.15,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{
                y: -3,
                scale: 1.02,
              }}
              className="group relative overflow-hidden rounded-2xl border-3 border-ink bg-white p-5 shadow-hard hover:shadow-brutalist transition-all"
            >
              {/* Skill accent */}
              <div
                className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r ${gradient}`}
              />

              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 border-2 border-ink/10"
                    style={{
                      backgroundColor: `${color}18`,
                    }}
                  >
                    <Icon
                      size={20}
                      style={{ color }}
                    />
                  </div>

                  <div>
                    <p className="text-sm font-black text-ink leading-tight dark:text-white">
                      {skill}
                    </p>

                    <p className="text-xs text-slate mt-0.5 font-black">
                      Band score
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className="text-2xl font-black tracking-tight tabular-nums"
                    style={{
                      color: hasScore
                        ? color
                        : "var(--slate)",
                    }}
                  >
                    {hasScore
                      ? band.toFixed(1)
                      : "—"}
                  </span>

                  {hasScore && (
                    <span className="ml-1 text-xs font-black text-slate">
                      /{MAX_BAND}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate">
                    {hasScore
                      ? `${pct}% proficiency`
                      : "Not assessed"}
                  </span>

                  <span className="font-black text-slate tabular-nums">
                    {hasScore
                      ? band.toFixed(1)
                      : "0.0"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-mist border border-mist relative">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                    initial={{ width: 0 }}
                    animate={
                      isInView
                        ? {
                            width: `${pct}%`,
                          }
                        : {}
                    }
                    transition={{
                      delay:
                        0.3 + index * 0.2,
                      duration: 1.2,
                      ease: "easeOut",
                    }}
                  />

                  {hasScore && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        left: 0,
                      }}
                      animate={
                        isInView
                          ? {
                              opacity: [0, 1, 0],
                              left: `${pct}%`,
                            }
                          : {}
                      }
                      transition={{
                        delay:
                          1.2 + index * 0.2,
                        duration: 0.8,
                      }}
                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_currentColor]"
                      style={{ color }}
                    />
                  )}
                </div>

                {/* IELTS milestones */}
                <div className="relative h-3 w-full">
                  {[3, 6, 9].map(
                    (milestone) => (
                      <div
                        key={milestone}
                        className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
                        style={{
                          left: `${
                            (milestone /
                              MAX_BAND) *
                            100
                          }%`,
                        }}
                      >
                        <div
                          className={`h-1 w-px transition-colors ${
                            hasScore &&
                            band >= milestone
                              ? "bg-slate dark:bg-slate-soft"
                              : "bg-mist dark:bg-slate/20"
                          }`}
                        />

                        <span
                          className={`text-[10px] font-black mt-0.5 ${
                            hasScore &&
                            band >= milestone
                              ? "text-slate dark:text-slate-soft"
                              : "text-slate/40 dark:text-slate/30"
                          }`}
                        >
                          {milestone}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          );
        }
      )}
    </div>
  );
}
