"use client";

import { useState } from "react";

interface AchievementCardProps {
  code: string;
  earned: boolean;
  earnedAt?: string;
  index?: number;
}

const ACHIEVEMENT_META: Record<string, { icon: string; color: string; desc: string }> = {
  first_steps: { icon: "🎯", color: "from-blue-400 to-blue-600", desc: "Complete your first practice test" },
  vocab_builder: { icon: "📚", color: "from-purple-400 to-purple-600", desc: "Create 10 vocabulary flashcards" },
  on_fire: { icon: "🔥", color: "from-orange-400 to-red-500", desc: "Maintain a 7-day streak" },
  unstoppable: { icon: "⚡", color: "from-yellow-400 to-orange-500", desc: "Maintain a 30-day streak" },
  legendary: { icon: "👑", color: "from-yellow-300 to-yellow-600", desc: "Maintain a 100-day streak" },
  xp_100: { icon: "💎", color: "from-teal-400 to-teal-600", desc: "Earn 100 XP total" },
  xp_500: { icon: "💎", color: "from-emerald-400 to-emerald-600", desc: "Earn 500 XP total" },
  xp_1000: { icon: "🌟", color: "from-amber-400 to-amber-600", desc: "Earn 1000 XP total" },
};

export function AchievementCard({ code, earned, earnedAt, index = 0 }: AchievementCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const meta = ACHIEVEMENT_META[code] || { icon: "🏆", color: "from-gray-400 to-gray-600", desc: "Mystery achievement" };

  return (
    <div
      className={`relative group cursor-pointer transition-all duration-300 ${
        earned ? "scale-100 opacity-100" : "scale-95 opacity-50 grayscale"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`rounded-2xl bg-gradient-to-br ${meta.color} p-4 shadow-lg 
          ${earned ? "animate-achievement-pop hover:scale-105" : ""} 
          ${isHovered && earned ? "ring-2 ring-white ring-offset-2 ring-offset-transparent" : ""}`}
      >
        <div className="text-3xl mb-2">{meta.icon}</div>
        <p className="text-xs font-bold text-white leading-tight">
          {code.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </p>
        {earned && earnedAt && (
          <p className="text-[10px] text-white/80 mt-1">
            {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}
      </div>
      
      {/* Tooltip */}
      <div
        className={`absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-navy text-white text-xs 
          whitespace-nowrap pointer-events-none transition-opacity duration-200 z-10
          ${isHovered ? "opacity-100" : "opacity-0"}`}
      >
        {meta.desc}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-navy rotate-45" />
      </div>
    </div>
  );
}