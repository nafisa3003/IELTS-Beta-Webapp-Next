"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { LogoutButton } from "@/components/shell/logout-button";

export type NavRole = "student" | "teacher" | "admin";

interface NavItem {
  label: string;
  href: string;
}

const STUDENT_NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "AI Tutor", href: "/tutor" },
  { label: "Learning", href: "/learning" },
  { label: "Practice", href: "/practice" },
  { label: "Rewards", href: "/rewards" },
  { label: "Announcements", href: "/announcements" },
  { label: "Support", href: "/support" },
];

const TEACHER_NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/teacher/courses" },
  { label: "Students", href: "/teacher/students" },
  { label: "Live Classes", href: "/teacher/live-classes" },
  { label: "Announcements", href: "/announcements" },
];

const ADMIN_NAV: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Users", href: "/admin/users" },
  { label: "Courses", href: "/admin/courses" },
  { label: "Content", href: "/admin/content" },
  { label: "Practice Tests", href: "/admin/practice-tests" },
  { label: "Announcements", href: "/admin/announcements" },
  { label: "Support", href: "/admin/support" },
  { label: "Logs", href: "/admin/logs" },
];

const NAV_BY_ROLE: Record<NavRole, NavItem[]> = {
  student: STUDENT_NAV,
  teacher: TEACHER_NAV,
  admin: ADMIN_NAV,
};

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

function getInitials(name: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TopNav({ role, displayName }: { role: NavRole; displayName: string }) {
  const pathname = usePathname();
  const scrolled = useScrolled();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const items = NAV_BY_ROLE[role];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b bg-[var(--cyan)] transition-all duration-300 ${
          scrolled
            ? "border-mist shadow-[0_1px_3px_rgba(0,0,0,0.03)] dark:border-slate/20 dark:bg-navy-deep/95"
            : "border-transparent dark:bg-navy-deep/60"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="IELTS Beta"
                width={60}
                height={30}
                className="h-[60px] w-auto object-contain [filter:drop-shadow(1px_0_0_#fff)_drop-shadow(-1px_0_0_#fff)_drop-shadow(0_1px_0_#fff)_drop-shadow(0_-1px_0_#fff)]"
              />
              <span className="text-xl font-extrabold tracking-tight text-navy dark:text-white">
                IELTS Beta
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:gap-1">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-paper text-ink shadow-sm ring-1 ring-mist dark:bg-white/[0.06] dark:text-white dark:ring-white/10"
                      : "text-slate hover:bg-mist/60 hover:text-ink dark:text-slate-soft dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Utilities */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserOpen(!userOpen)}
                className={`flex items-center gap-2 rounded-full p-1 pr-3 transition-colors ${
                  userOpen
                    ? "bg-mist dark:bg-white/10"
                    : "hover:bg-mist/60 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy text-xs font-bold text-white dark:bg-teal">
                  {getInitials(displayName)}
                </div>
                <span className="hidden max-w-[120px] truncate text-sm font-medium text-ink dark:text-white lg:block">
                  {displayName}
                </span>
                <svg
                  className={`h-4 w-4 text-slate transition-transform duration-200 ${
                    userOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {userOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-mist bg-white p-1.5 shadow-lg ring-1 ring-black/5 dark:border-slate/20 dark:bg-slate-900 dark:ring-white/10">
                  <div className="px-3 py-2.5">
                    <p className="text-sm font-semibold text-ink dark:text-white">
                      Signed in as
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate dark:text-slate-soft">
                      {displayName}
                    </p>
                  </div>
                  <div className="h-px bg-mist dark:bg-slate/20" />
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate transition-colors hover:bg-mist hover:text-ink dark:text-slate-soft dark:hover:bg-white/5 dark:hover:text-white"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Profile & settings
                  </Link>
                  <div className="h-px bg-mist dark:bg-slate/20" />
                  <div className="px-1 py-1">
                    <div className="px-1 py-1">
                      <LogoutButton className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate transition-colors hover:bg-mist hover:text-ink dark:text-slate-soft dark:hover:bg-white/5 dark:hover:text-white">
                        <svg
                          className="h-4 w-4 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        Log out
                      </LogoutButton>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="ml-1 inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate transition-colors hover:bg-mist dark:text-slate-soft dark:hover:bg-white/5 md:hidden"
            >
              {mobileOpen ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Sheet */}
      {mobileOpen && (
        <div className="fixed inset-x-0 top-16 z-40 border-b border-mist bg-surface/98 p-4 shadow-lg backdrop-blur-xl dark:border-slate/20 dark:bg-navy-deep/98 md:hidden">
          <nav className="flex flex-col gap-1">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-paper text-ink shadow-sm ring-1 ring-mist dark:bg-white/[0.06] dark:text-white dark:ring-white/10"
                      : "text-slate hover:bg-mist/60 hover:text-ink dark:text-slate-soft dark:hover:bg-white/5 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}