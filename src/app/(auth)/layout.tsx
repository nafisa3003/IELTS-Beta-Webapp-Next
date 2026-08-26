import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/shell/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* Top bar: logo + theme toggle */}
      <div className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Link
          href="/"
          aria-label="IELTS Beta home"
          className="transition-opacity hover:opacity-80"
        >
          {/* LOGO FIX: white badge so transparent PNG is visible */}
          <div className="rounded-xl bg-white p-2.5 shadow-card ring-1 ring-mist">
            <Image
              src="/logo.png"
              alt="IELTS Beta"
              width={140}
              height={42}
              priority
              className="h-8 w-auto object-contain"
            />
          </div>
        </Link>

        <ThemeToggle />
      </div>

      {/* Centered content */}
      <div className="flex flex-col items-center px-5 pb-20 pt-6 sm:px-8">
        <div className="w-full max-w-[440px]">
          {children}
        </div>
      </div>
    </main>
  );
}