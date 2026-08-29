"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface AchievementCardProps {
  code: string;
  earned: boolean;
  earnedAt?: string | null;
  index?: number;
}

const ACHIEVEMENT_META: Record<
  string,
  {
    icon: string;
    color: string;
    desc: string;
  }
> = {
  first_steps: {
    icon: "🎯",
    color: "from-blue-400 to-blue-600",
    desc: "Complete your first practice test",
  },
  vocab_builder: {
    icon: "📚",
    color: "from-purple-400 to-purple-600",
    desc: "Create 10 vocabulary flashcards",
  },
  on_fire: {
    icon: "🔥",
    color: "from-orange-400 to-red-500",
    desc: "Maintain a 7-day streak",
  },
  unstoppable: {
    icon: "⚡",
    color: "from-yellow-400 to-orange-500",
    desc: "Maintain a 30-day streak",
  },
  legendary: {
    icon: "👑",
    color: "from-yellow-300 to-yellow-600",
    desc: "Maintain a 100-day streak",
  },
  xp_100: {
    icon: "💎",
    color: "from-teal-400 to-teal-600",
    desc: "Earn 100 XP total",
  },
  xp_500: {
    icon: "💎",
    color: "from-emerald-400 to-emerald-600",
    desc: "Earn 500 XP total",
  },
  xp_1000: {
    icon: "🌟",
    color: "from-amber-400 to-amber-600",
    desc: "Earn 1,000 XP total",
  },
  xp_5000: {
    icon: "⭐",
    color: "from-cyan-400 to-cyan-600",
    desc: "Earn 5,000 XP total",
  },
  xp_10000: {
    icon: "🏆",
    color: "from-rose-400 to-rose-600",
    desc: "Earn 10,000 XP total",
  },
};

export function AchievementCard({
  code,
  earned,
  earnedAt,
  index = 0,
}: AchievementCardProps) {
  const [isHovered, setIsHovered] =
    useState(false);

  const meta =
    ACHIEVEMENT_META[code] ?? {
      icon: "🏆",
      color: "from-gray-400 to-gray-600",
      desc: "Mystery achievement",
    };

  const displayName = code
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) =>
      c.toUpperCase()
    );

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.5,
        rotate: -10,
      }}
      animate={{
        opacity: earned ? 1 : 0.6,
        scale: earned ? 1 : 0.95,
        rotate: 0,
      }}
      transition={{
        delay: index * 0.05,
        type: "spring",
        stiffness: 200,
      }}
      className="relative group cursor-pointer"
      onMouseEnter={() =>
        setIsHovered(true)
      }
      onMouseLeave={() =>
        setIsHovered(false)
      }
    >
      <motion.div
        whileHover={
          earned
            ? {
                scale: 1.08,
                rotate: 2,
              }
            : {}
        }
        className={`rounded-2xl bg-gradient-to-br ${meta.color} p-4 shadow-hard border-2 ${
          earned
            ? "border-white/30"
            : "border-gray-300"
        } relative overflow-hidden`}
      >
        {/* Cinematic shine effect */}
        {earned && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        )}

        {/* Achievement icon */}
        <div className="text-3xl mb-2 relative z-10">
          {meta.icon}
        </div>

        {/* Achievement name */}
        <p className="text-xs font-black text-white leading-tight relative z-10">
          {displayName}
        </p>

        {/* Earned date */}
        {earned && earnedAt && (
          <p className="text-[10px] text-white/80 mt-1 relative z-10 font-bold">
            {new Date(
              earnedAt
            ).toLocaleDateString()}
          </p>
        )}

        {/* Locked overlay */}
        {!earned && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-2xl">
            <Lock className="h-6 w-6 text-white/50" />
          </div>
        )}
      </motion.div>

      {/* Tooltip */}
      <div
        className={`absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-navy text-white text-xs whitespace-nowrap pointer-events-none transition-opacity duration-200 z-10 font-bold border-2 border-ink shadow-hard ${
          isHovered
            ? "opacity-100"
            : "opacity-0"
        }`}
      >
        {meta.desc}

        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-navy rotate-45 border-r-2 border-b-2 border-ink" />
      </div>
    </motion.div>
  );
}
