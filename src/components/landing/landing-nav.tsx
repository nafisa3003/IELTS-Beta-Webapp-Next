"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogoutButton } from "@/components/shell/logout-button"
import type { NavRole } from "@/components/shell/top-nav"

const navLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "For teachers", href: "#for-teachers" },
  { label: "Pricing", href: "#pricing" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
]

const ROLE_LINKS: Record<NavRole, { label: string; href: string }[]> = {
  student: [
    { label: "Dashboard", href: "/dashboard" },
    { label: "AI Tutor", href: "/tutor" },
    { label: "Learning", href: "/learning" },
    { label: "Practice", href: "/practice" },
  ],
  teacher: [
    { label: "Courses", href: "/teacher/courses" },
    { label: "Students", href: "/teacher/students" },
    { label: "Live Classes", href: "/teacher/live-classes" },
  ],
  admin: [
    { label: "Users", href: "/admin/users" },
    { label: "Courses", href: "/admin/courses" },
    { label: "Content", href: "/admin/content" },
  ],
}

function getInitials(name: string) {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

interface LandingNavProps {
  user?: {
    id: string
    email?: string | null
  } | null
  displayName?: string
  role?: NavRole
  avatarUrl?: string | null
}

export function LandingNav({ user, displayName = "", role = "student", avatarUrl }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const userRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const isLoggedIn = !!user
  const roleLinks = role ? ROLE_LINKS[role] : []

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[var(--white)]/80 backdrop-blur-xl border-b-2 border-[var(--mist)] shadow-sm"
            : "bg-[#78FFF9]"
        }`}
      >
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between py-5">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="IELTS Beta"
                width={90}
                height={30}
                className="h-[90px] w-auto object-contain [filter:drop-shadow(1px_0_0_#fff)_drop-shadow(-1px_0_0_#fff)_drop-shadow(0_1px_0_#fff)_drop-shadow(0_-1px_0_#fff)]"
              />
              <span className="text-xl font-extrabold tracking-tight text-[var(--navy)] dark:text-white">
                IELTS Beta
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/"
                    className={`text-sm font-semibold transition-colors ${
                      scrolled ? "text-[var(--slate)] hover:text-[var(--navy)]" : "text-[#0F1720]/80 hover:text-[#0F1720]"
                    } ${pathname === "/" ? "text-[var(--navy)]" : ""}`}
                  >
                    Home
                  </Link>
                  {roleLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-sm font-semibold transition-colors ${
                        scrolled ? "text-[var(--slate)] hover:text-[var(--navy)]" : "text-[#0F1720]/80 hover:text-[#0F1720]"
                      } ${pathname === link.href ? "text-[var(--navy)]" : ""}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </>
              ) : (
                navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className={`text-sm font-semibold transition-colors ${
                      scrolled ? "text-[var(--slate)] hover:text-[var(--navy)]" : "text-[#0F1720]/80 hover:text-[#0F1720]"
                    }`}
                  >
                    {link.label}
                  </a>
                ))
              )}
            </nav>

            {/* Right side */}
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setUserOpen(!userOpen)}
                    className={`flex items-center gap-2 rounded-full p-1 pr-3 transition-colors ${
                      userOpen
                        ? "bg-[var(--mist)] dark:bg-white/10"
                        : "hover:bg-[var(--mist)]/60 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[var(--navy)] text-xs font-bold text-white dark:bg-[var(--teal)]">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={displayName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        getInitials(displayName)
                      )}
                    </div>
                    <span className="hidden max-w-[120px] truncate text-sm font-medium text-[var(--ink)] dark:text-white lg:block">
                      {displayName}
                    </span>
                    <svg
                      className={`h-4 w-4 text-[var(--slate)] transition-transform duration-200 ${
                        userOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {userOpen && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl border border-[var(--mist)] bg-white p-1.5 shadow-lg ring-1 ring-black/5 dark:border-slate/20 dark:bg-slate-900 dark:ring-white/10">
                      <div className="flex items-center gap-3 px-3 py-2.5">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--navy)] text-xs font-bold text-white dark:bg-[var(--teal)]">
                          {avatarUrl ? (
                            <Image
                              src={avatarUrl}
                              alt={displayName}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            getInitials(displayName)
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-[var(--ink)] dark:text-white truncate">
                            {displayName}
                          </p>
                          <p className="text-xs text-[var(--slate)] dark:text-slate-soft truncate">
                            Signed in
                          </p>
                        </div>
                      </div>
                      <div className="h-px bg-[var(--mist)] dark:bg-slate/20" />
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--slate)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)] dark:text-slate-soft dark:hover:bg-white/5 dark:hover:text-white"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile & settings
                      </Link>
                      <div className="h-px bg-[var(--mist)] dark:bg-slate/20" />
                      <div className="px-1 py-1">
                        <LogoutButton className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--slate)] transition-colors hover:bg-[var(--mist)] hover:text-[var(--ink)] dark:text-slate-soft dark:hover:bg-white/5 dark:hover:text-white">
                          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Log out
                        </LogoutButton>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`text-sm font-semibold px-4 py-2 rounded-full border-2 transition-colors ${
                      scrolled
                        ? "text-[var(--navy)] border-[var(--navy)]/10 hover:border-[var(--navy)]/30"
                        : "text-[#0F1720] border-[#0F1720]/20 hover:border-[#0F1720]/40"
                    }`}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="text-sm font-bold text-white bg-[var(--navy)] hover:bg-[var(--navy-deep)] transition-colors px-6 py-2.5 rounded-full border-2 border-[var(--navy)]"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              className="md:hidden p-2 text-[#0F1720]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[var(--white)] pt-24 px-6 md:hidden"
          >
            <nav className="flex flex-col gap-4">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-3 pb-4 border-b-2 border-[var(--mist)]">
                    <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-[var(--navy)] text-sm font-bold text-white">
                      {avatarUrl ? (
                        <Image
                          src={avatarUrl}
                          alt={displayName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        getInitials(displayName)
                      )}
                    </div>
                    <div>
                      <p className="text-base font-bold text-[var(--navy)]">{displayName}</p>
                      <p className="text-xs text-[var(--slate)]">Signed in</p>
                    </div>
                  </div>
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-bold text-[var(--navy)] py-3 border-b-2 border-[var(--mist)]"
                  >
                    Home
                  </Link>
                  {roleLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-lg font-bold text-[var(--navy)] py-3 border-b-2 border-[var(--mist)]"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-bold text-[var(--navy)] py-3 border-b-2 border-[var(--mist)]"
                  >
                    Profile & settings
                  </Link>
                  <div className="mt-4">
                    <LogoutButton className="w-full text-center text-base font-bold text-[var(--danger)] border-2 border-[var(--danger)]/20 rounded-full py-3">
                      Log out
                    </LogoutButton>
                  </div>
                </>
              ) : (
                <>
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-lg font-bold text-[var(--navy)] py-3 border-b-2 border-[var(--mist)]"
                    >
                      {link.label}
                    </a>
                  ))}
                  <div className="mt-4 flex flex-col gap-3">
                    <Link
                      href="/login"
                      className="w-full text-center text-base font-bold text-[var(--navy)] border-2 border-[var(--navy)]/10 rounded-full py-3"
                    >
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      className="w-full text-center text-base font-bold text-white bg-[var(--navy)] rounded-full py-3"
                    >
                      Get started
                    </Link>
                  </div>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
