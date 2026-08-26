"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // Avoid a hydration mismatch: the real theme isn't known until mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="relative flex h-9 w-16 items-center rounded-pill border border-mist bg-mist/60 px-1 transition-colors"
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full bg-surface shadow-card transition-transform duration-200"
        style={{ transform: isDark ? "translateX(28px)" : "translateX(0)" }}
      >
        {isDark ? <MoonShape /> : <SunShape />}
      </span>
    </button>
  );
}

function SunShape() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" fill="var(--xp)" />
      <g stroke="var(--xp)" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="1.5" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22.5" />
        <line x1="1.5" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22.5" y2="12" />
        <line x1="4.5" y1="4.5" x2="6.2" y2="6.2" />
        <line x1="17.8" y1="17.8" x2="19.5" y2="19.5" />
        <line x1="4.5" y1="19.5" x2="6.2" y2="17.8" />
        <line x1="17.8" y1="6.2" x2="19.5" y2="4.5" />
      </g>
    </svg>
  );
}

function MoonShape() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 13.5A8.5 8.5 0 1 1 10.5 4a6.8 6.8 0 0 0 9.5 9.5Z"
        fill="var(--violet)"
      />
    </svg>
  );
}
