"use client";

import { motion } from "framer-motion";
import { useId } from "react";

interface XpGemProps {
  size?: number;
  className?: string;
  count?: number;
}

export function XpGem({
  size = 28,
  className = "",
  count = 1,
}: XpGemProps) {
  if (count > 1) {
    const visibleCount = Math.min(count, 5);

    return (
      <div
        className={`relative inline-flex items-center ${className}`}
        style={{
          width: size * 1.5,
          height: size,
        }}
      >
        {Array.from({ length: visibleCount }, (_, i) => (
          <motion.div
            key={i}
            initial={{
              scale: 0,
              rotate: -180,
            }}
            animate={{
              scale: 1,
              rotate: 0,
            }}
            transition={{
              delay: i * 0.1,
              type: "spring",
              stiffness: 200,
            }}
            className="absolute animate-gem-sparkle"
            style={{
              left: `${i * (size * 0.25)}px`,
              top: `${Math.sin(i) * 4}px`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            <SingleGem size={size * 0.7} />
          </motion.div>
        ))}

        {count > 5 && (
          <span className="absolute -right-2 -top-1 rounded-full border border-xp/30 bg-white px-1 text-[8px] font-black text-xp">
            +{count - 5}
          </span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{
        scale: 1.2,
        rotate: 15,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
      }}
      className={`inline-block ${className}`}
    >
      <SingleGem size={size} />
    </motion.div>
  );
}

function SingleGem({ size }: { size: number }) {
  const id = useId().replace(/:/g, "");
  const gradientId = `gemGrad-${id}`;
  const glowId = `gemGlow-${id}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      className="animate-gem-sparkle"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="14"
          y1="0"
          x2="14"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#58CC02" />
          <stop offset="50%" stopColor="#7EE017" />
          <stop offset="100%" stopColor="#43A000" />
        </linearGradient>

        <filter id={glowId}>
          <feGaussianBlur
            stdDeviation="1.5"
            result="coloredBlur"
          />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main gem */}
      <path
        d="M14 0L26.124 7L14 28L1.876 7L14 0Z"
        fill={`url(#${gradientId})`}
        filter={`url(#${glowId})`}
      />

      {/* Left facet */}
      <path
        d="M14 0L14 28L1.876 7L14 0Z"
        fill="#6ADB0F"
        opacity="0.5"
      />

      {/* Right facet */}
      <path
        d="M14 0L26.124 7L14 28L14 0Z"
        fill="#3D8C00"
        opacity="0.3"
      />

      {/* Inner highlight */}
      <path
        d="M14 2L22 7L14 24L6 7L14 2Z"
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.5"
      />
    </svg>
  );
}
