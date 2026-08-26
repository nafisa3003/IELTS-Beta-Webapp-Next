"use client";

export function XpGem({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      className={`${className} animate-gem-sparkle`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gemGrad" x1="14" y1="0" x2="14" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#58CC02" />
          <stop offset="100%" stopColor="#43A000" />
        </linearGradient>
      </defs>
      <path
        d="M14 0L26.124 7L14 28L1.876 7L14 0Z"
        fill="url(#gemGrad)"
      />
      <path d="M14 0L14 28L1.876 7L14 0Z" fill="#6ADB0F" opacity="0.5" />
      <path d="M14 0L26.124 7L14 28L14 0Z" fill="#3D8C00" opacity="0.3" />
    </svg>
  );
}