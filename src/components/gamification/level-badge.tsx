"use client";

import { motion } from "framer-motion";

interface LevelBadgeProps {
  level: number;
  title: string;
  size?: "sm" | "md" | "lg";
}

const LEVEL_COLORS: Record<number, string> = {
  1: "from-gray-400 to-gray-600",
  2: "from-amber-400 to-amber-600",
  3: "from-orange-400 to-orange-600",
  4: "from-teal-400 to-teal-600",
  5: "from-blue-400 to-blue-600",
  6: "from-violet-400 to-violet-600",
  7: "from-purple-400 to-purple-600",
  8: "from-pink-400 to-rose-600",
  9: "from-red-400 to-red-600",
  10: "from-yellow-300 via-amber-400 to-yellow-600",
};

const SIZE_CLASSES = {
  sm: "w-10 h-10 text-sm",
  md: "w-14 h-14 text-base",
  lg: "w-20 h-20 text-xl",
} as const;

export function LevelBadge({
  level,
  title,
  size = "md",
}: LevelBadgeProps) {
  const safeLevel =
    Number.isFinite(level) && level > 0
      ? Math.floor(level)
      : 1;

  const colorClass =
    LEVEL_COLORS[safeLevel] ??
    LEVEL_COLORS[10];

  const sizeClass =
    SIZE_CLASSES[size];

  return (
    <motion.div
      initial={{
        scale: 0,
        rotate: -180,
      }}
      animate={{
        scale: 1,
        rotate: 0,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
      whileHover={{
        scale: 1.1,
        rotate: 5,
      }}
      className="relative group"
    >
      {/* Glow */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br ${colorClass} blur-md opacity-40 group-hover:opacity-60 transition-opacity`}
      />

      {/* Badge */}
      <div
        className={`${sizeClass} rounded-full bg-gradient-to-br ${colorClass} flex items-center justify-center font-black text-white shadow-hard border-2 border-white/30 relative z-10`}
      >
        {safeLevel}
      </div>

      {/* Crown for advanced levels */}
      {safeLevel >= 5 && (
        <motion.div
          initial={{
            opacity: 0,
            y: 5,
            scale: 0.7,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            delay: 0.3,
            type: "spring",
            stiffness: 250,
          }}
          className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs z-20"
        >
          👑
        </motion.div>
      )}

      {/* Level title */}
      {size !== "sm" && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate whitespace-nowrap bg-white px-2 py-0.5 rounded-full border border-mist">
          {title}
        </span>
      )}
    </motion.div>
  );
}
