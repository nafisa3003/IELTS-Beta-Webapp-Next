"use client";

interface LevelBadgeProps {
  level: number;
  title: string;
  size?: "sm" | "md" | "lg";
}

export function LevelBadge({ level, title, size = "md" }: LevelBadgeProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base",
  };

  return (
    <div className="relative group">
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 
          flex items-center justify-center font-bold text-white shadow-lg 
          animate-badge-bounce border-2 border-yellow-200`}
      >
        {level}
      </div>
      {size !== "sm" && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-slate whitespace-nowrap">
          {title}
        </span>
      )}
    </div>
  );
}