"use client";

export function AnimatedFlame({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={`${className} animate-flame-flicker`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="flameGrad" x1="16" y1="32" x2="16" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6B35" />
          <stop offset="50%" stopColor="#F7931E" />
          <stop offset="100%" stopColor="#FFD700" />
        </linearGradient>
      </defs>
      <path
        d="M16 2C16 2 8 10 8 18C8 22.4183 11.5817 26 16 26C20.4183 26 24 22.4183 24 18C24 10 16 2 16 2Z"
        fill="url(#flameGrad)"
      />
      <path
        d="M16 10C16 10 12 14 12 18C12 20.2091 13.7909 22 16 22C18.2091 22 20 20.2091 20 18C20 14 16 10 16 10Z"
        fill="#FFF5E6"
        opacity="0.9"
        className="animate-flame-inner"
      />
    </svg>
  );
}