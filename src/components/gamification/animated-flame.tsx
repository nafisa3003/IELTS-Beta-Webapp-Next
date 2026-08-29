"use client";

import { motion } from "framer-motion";
import { useId } from "react";

interface AnimatedFlameProps {
  size?: number;
  className?: string;
}

export function AnimatedFlame({
  size = 32,
  className = "",
}: AnimatedFlameProps) {
  const id = useId();

  const flameGradId = `flameGrad-${id}`;
  const flameGrad2Id = `flameGrad2-${id}`;

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        className="animate-flame-flicker"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Outer flame gradient */}
          <linearGradient
            id={flameGradId}
            x1="16"
            y1="32"
            x2="16"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="0%"
              stopColor="#FF6B35"
            />
            <stop
              offset="40%"
              stopColor="#F7931E"
            />
            <stop
              offset="80%"
              stopColor="#FFD700"
            />
            <stop
              offset="100%"
              stopColor="#FFF5E6"
            />
          </linearGradient>

          {/* Outer/deep flame gradient */}
          <linearGradient
            id={flameGrad2Id}
            x1="16"
            y1="32"
            x2="16"
            y2="8"
            gradientUnits="userSpaceOnUse"
          >
            <stop
              offset="0%"
              stopColor="#E5502F"
            />
            <stop
              offset="100%"
              stopColor="#FF6B35"
            />
          </linearGradient>
        </defs>

        {/* Main animated flame */}
        <motion.path
          d="M16 2C16 2 6 10 6 18C6 22.4183 11.5817 26 16 26C20.4183 26 26 22.4183 26 18C26 10 16 2 16 2Z"
          fill={`url(#${flameGrad2Id})`}
          animate={{
            d: [
              "M16 2C16 2 6 10 6 18C6 22.4183 11.5817 26 16 26C20.4183 26 26 22.4183 26 18C26 10 16 2 16 2Z",
              "M16 1C16 1 5 9 5 17C5 22 11 27 16 27C21 27 27 22 27 17C27 9 16 1 16 1Z",
              "M16 2C16 2 6 10 6 18C6 22.4183 11.5817 26 16 26C20.4183 26 26 22.4183 26 18C26 10 16 2 16 2Z",
            ],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Inner flame */}
        <path
          d="M16 10C16 10 12 14 12 18C12 20.2091 13.7909 22 16 22C18.2091 22 20 20.2091 20 18C20 14 16 10 16 10Z"
          fill={`url(#${flameGradId})`}
          className="animate-flame-inner"
        />

        {/* Flame core */}
        <path
          d="M16 14C16 14 14 16 14 18C14 19.1046 14.8954 20 16 20C17.1046 20 18 19.1046 18 18C18 16 16 14 16 14Z"
          fill="#FFF5E6"
          opacity="0.9"
        />
      </svg>

      {/* Floating sparks */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute h-1 w-1 rounded-full bg-yellow-400"
          style={{
            left: `${40 + i * 10}%`,
            bottom: "20%",
          }}
          animate={{
            y: [
              0,
              -20 - i * 10,
              -40 - i * 15,
            ],
            x: [
              0,
              (i - 1) * 8,
              (i - 1) * 15,
            ],
            opacity: [1, 0.8, 0],
            scale: [1, 0.6, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}
