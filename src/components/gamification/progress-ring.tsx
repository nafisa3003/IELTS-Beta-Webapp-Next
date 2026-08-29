"use client";

import { motion } from "framer-motion";
import { useId } from "react";

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
  animate?: boolean;
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  children,
  animate = true,
}: ProgressRingProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset =
    circumference - (clampedProgress / 100) * circumference;

  // Prevent SVG ID collisions when multiple rings are rendered.
  const id = useId().replace(/:/g, "");
  const gradientId = `progressGrad-${id}`;
  const glowId = `progressGlow-${id}`;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <defs>
          <filter id={glowId}>
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
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
          >
            <stop offset="0%" stopColor="#58CC02" />
            <stop offset="100%" stopColor="#43A000" />
          </linearGradient>
        </defs>

        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />

        {/* Progress ring */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={
            animate
              ? { strokeDashoffset: circumference }
              : { strokeDashoffset: offset }
          }
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: 1.5,
            ease: "easeOut",
          }}
          filter={
            clampedProgress >= 90
              ? `url(#${glowId})`
              : undefined
          }
        />

        {/* Celebration pulse for 90%+ */}
        {clampedProgress >= 90 && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius + 6}
            fill="none"
            stroke="#0EA599"
            strokeWidth="2"
            initial={{ opacity: 0 }}
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
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
