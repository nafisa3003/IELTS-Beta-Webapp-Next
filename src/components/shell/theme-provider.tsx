"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes/dist/types";

// Matches the existing `.dark { ... }` token block in globals.css —
// next-themes just toggles the `dark` class on <html>, tokens already exist.
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" enableSystem {...props}>
      {children}
    </NextThemesProvider>
  );
}
