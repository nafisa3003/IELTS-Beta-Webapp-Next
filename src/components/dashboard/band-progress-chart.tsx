"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const MAX_BAND = 9;

type BandProgressChartProps = {
  currentBand: number | null;
  targetBand: number | null;
};

export function BandProgressChart({
  currentBand,
  targetBand,
}: BandProgressChartProps) {
  /*
   * Real database values can be null before the student
   * has completed onboarding / received a band score.
   */
  const current = currentBand ?? 0;
  const target = targetBand ?? MAX_BAND;

  const progressPct =
    target > 0
      ? Math.min(
          100,
          Math.round((current / target) * 100)
        )
      : 0;

  const ref = useRef<HTMLDivElement | null>(null);

  const isInView = useInView(ref, {
    once: true,
    margin: "-50px",
  });

  const [displayBand, setDisplayBand] = useState(0);

  /*
   * Cinematic number animation.
   *
   * This is visual-only. The actual currentBand still
   * comes directly from the database through the parent.
   */
  useEffect(() => {
    if (!isInView) return;

    if (current <= 0) {
      setDisplayBand(0);
      return;
    }

    let step = 0;

    const interval = setInterval(() => {
      step += 0.1;

      if (step >= current) {
        setDisplayBand(current);
        clearInterval(interval);
      } else {
        setDisplayBand(step);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [isInView, current]);

  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  const strokeDashoffset =
    circumference -
    (progressPct / 100) * circumference;

  return (
    <div
      ref={ref}
      className="relative flex flex-col items-center"
    >
      <div className="relative h-44 w-44">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 120 120"
          className="-rotate-90"
          aria-hidden="true"
        >
          <defs>
            <filter id="band-glow">
              <feGaussianBlur
                stdDeviation="3"
                result="coloredBlur"
              />

              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient
              id="band-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                stopColor="#0EA599"
              />

              <stop
                offset="100%"
                stopColor="#78FFF9"
              />
            </linearGradient>
          </defs>

          {/* Background ring */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="var(--mist)"
            strokeWidth="12"
          />

          {/* Animated progress ring */}
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="url(#band-gradient)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{
              strokeDashoffset: circumference,
            }}
            animate={
              isInView
                ? {
                    strokeDashoffset,
                  }
                : {}
            }
            transition={{
              duration: 2,
              ease: "easeOut",
              delay: 0.3,
            }}
            filter={
              progressPct >= 80
                ? "url(#band-glow)"
                : undefined
            }
          />

          {/* High-progress glow */}
          {progressPct >= 80 && (
            <motion.circle
              cx="60"
              cy="60"
              r={radius + 6}
              fill="none"
              stroke="#0EA599"
              strokeWidth="2"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: [0, 0.4, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
          )}
        </svg>

        {/* Center content */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{
              opacity: 0,
              scale: 0.5,
            }}
            animate={
              isInView
                ? {
                    opacity: 1,
                    scale: 1,
                  }
                : {}
            }
            transition={{
              delay: 1,
              type: "spring",
            }}
            className="font-display text-4xl font-black text-navy dark:text-white"
          >
            {current > 0
              ? displayBand.toFixed(1)
              : "—"}
          </motion.span>

          <span className="text-xs font-black text-slate">
            of {target.toFixed(1)} target
          </span>
        </div>
      </div>

      <motion.p
        initial={{
          opacity: 0,
        }}
        animate={
          isInView
            ? {
                opacity: 1,
              }
            : {}
        }
        transition={{
          delay: 1.2,
        }}
        className="mt-3 text-sm font-black text-teal"
      >
        {progressPct}% of the way there 🎯
      </motion.p>
    </div>
  );
}
