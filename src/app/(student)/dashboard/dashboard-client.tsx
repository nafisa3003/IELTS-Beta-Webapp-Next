"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import confetti from "canvas-confetti"
import Link from "next/link"
import { ArrowRight, Target, Trophy } from "lucide-react"

import { BandProgressChart } from "@/components/dashboard/band-progress-chart"
import { SkillProgress } from "@/components/dashboard/skill-progress"
import { XpGem } from "@/components/gamification/xp-gem"
import { AnimatedFlame } from "@/components/gamification/animated-flame"
import { LevelBadge } from "@/components/gamification/level-badge"
import { BookIcon } from "@/components/icons/stat-icons"
import type { LevelInfo } from "@/lib/repositories/gamification.repository"
import type { Skill } from "@/types/assessment"

type DashboardView = {
  course: {
    courseid: string | number
    title: string
    level?: string | null
  }
  contents: unknown[]
}

type StudentData = {
  current_band: number | null
  target_band: number | null
}

type StreakData = {
  current_streak: number
  longest_streak: number
} | null

type DashboardClientProps = {
  views: DashboardView[]
  student: StudentData | null
  xpTotal: number
  streak: StreakData
  levelInfo: LevelInfo
  skillBands: Partial<Record<Skill, number>>
}

function StatCard({
  icon,
  label,
  value,
  suffix,
  accent,
  bg,
  border,
  iconBg,
  textLight,
  highlight,
  delay = 0,
}: {
  icon: React.ReactNode
  label: string
  value: number
  suffix?: string
  accent: string
  bg: string
  border: string
  iconBg: string
  textLight?: boolean
  highlight?: boolean
  delay?: number
}) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLDivElement | null>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return

    let current = 0
    const step = value / 30

    const interval = setInterval(() => {
      current += step

      if (current >= value) {
        setDisplayValue(value)
        clearInterval(interval)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, 30)

    return () => clearInterval(interval)
  }, [isInView, value])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay,
        type: "spring",
        stiffness: 100,
      }}
      whileHover={{
        y: -5,
        scale: 1.02,
      }}
      className={`relative overflow-hidden rounded-2xl border-3 p-5 shadow-hard transition-all hover:shadow-brutalist ${bg} ${border} ${
        highlight ? "ring-2 ring-orange-300" : ""
      }`}
    >
      <div
        className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-ink/10 ${iconBg}`}
      >
        {icon}
      </div>

      <p
        className={`text-xs font-black uppercase tracking-wider ${
          textLight ? "text-white/70" : "text-slate"
        }`}
      >
        {label}
      </p>

      <p
        className={`font-display text-3xl font-black tracking-tight ${accent}`}
      >
        {displayValue.toLocaleString()}

        {suffix && (
          <span
            className={`ml-1 text-sm font-bold ${
              textLight ? "text-white/70" : "text-slate"
            }`}
          >
            {suffix}
          </span>
        )}
      </p>
    </motion.div>
  )
}

export default function DashboardClient({
  views,
  student,
  xpTotal,
  streak,
  levelInfo,
  skillBands,
}: DashboardClientProps) {
  const [confettiFired, setConfettiFired] = useState(false)

  const headerRef = useRef<HTMLDivElement | null>(null)

  const isInView = useInView(headerRef, {
    once: true,
  })

  // Same null-safe fallback pattern rewards-client already uses for streak.
  const currentStreak = streak?.current_streak ?? 0
  const longestStreak = streak?.longest_streak ?? 0

  // Skill bands come from the student's latest graded attempts and may be
  // partial (or entirely empty for a brand-new student) — default any
  // skill with no attempt yet to 0 rather than crashing SkillProgress.
  const resolvedSkillBands: Record<Skill, number> = {
    Listening: skillBands.Listening ?? 0,
    Reading: skillBands.Reading ?? 0,
    Writing: skillBands.Writing ?? 0,
    Speaking: skillBands.Speaking ?? 0,
  }

  useEffect(() => {
    if (
      isInView &&
      !confettiFired &&
      currentStreak > 0
    ) {
      setConfettiFired(true)

      const timeout = setTimeout(() => {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.3 },
          colors: ["#78FFF9", "#0EA599", "#F5A524"],
        })
      }, 500)

      return () => clearTimeout(timeout)
    }
  }, [isInView, confettiFired, currentStreak])

  return (
    <div className="flex flex-col gap-8">
      {/* 
          WELCOME HEADER
      */}

      <div
        ref={headerRef}
        className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"
      >
        <div className="space-y-1">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="font-display text-3xl font-black tracking-tighter text-navy dark:text-white sm:text-5xl"
          >
            Welcome back! 👋
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-base font-medium text-slate"
          >
            {views.length > 0
              ? `You're enrolled in ${views.length} course${
                  views.length > 1 ? "s" : ""
                }.`
              : "You're not enrolled in a course yet — ask your teacher to add you."}
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.3,
            type: "spring",
          }}
          className="flex items-center gap-3 rounded-2xl border-3 border-ink bg-white px-5 py-3 shadow-hard"
        >
          <LevelBadge
            level={levelInfo.level}
            title={levelInfo.title}
            size="sm"
          />

          <div className="hidden sm:block">
            <p className="text-xs font-black uppercase tracking-wider text-slate">
              {levelInfo.title}
            </p>

            <div className="mt-1 h-2.5 w-28 overflow-hidden rounded-full border border-mist bg-mist">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-teal to-cyan"
                initial={{ width: 0 }}
                animate={{
                  width: `${levelInfo.progressPercent}%`,
                }}
                transition={{
                  delay: 0.8,
                  duration: 1.5,
                  ease: "easeOut",
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* 
          STATS GRID
      */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<XpGem size={24} />}
          label="Total XP"
          value={xpTotal}
          accent="text-navy"
          bg="bg-gradient-to-br from-cyan to-cyan-light"
          border="border-teal/30"
          iconBg="bg-white/60"
          delay={0}
        />

        <StatCard
          icon={<AnimatedFlame size={24} />}
          label="Current streak"
          value={currentStreak}
          suffix="days"
          accent="text-navy"
          bg="bg-gradient-to-br from-orange-100 to-amber-50"
          border="border-orange-300"
          iconBg="bg-white/60"
          highlight={currentStreak > 0}
          delay={0.1}
        />

        {/* REAL DATABASE COURSE COUNT */}
        <StatCard
          icon={<BookIcon size={24} />}
          label="Courses"
          value={views.length}
          accent="text-white"
          bg="bg-navy"
          border="border-navy-deep"
          iconBg="bg-white/10"
          textLight
          delay={0.2}
        />

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            delay: 0.3,
            type: "spring",
          }}
          whileHover={{
            y: -5,
            scale: 1.02,
          }}
        >
          <Link
            href="/practice"
            className="group flex h-full flex-col justify-center rounded-2xl border-3 border-ink bg-gradient-to-br from-navy to-navy-deep p-5 text-white shadow-hard transition-all hover:shadow-brutalist"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10">
              <Target size={20} className="text-cyan" />
            </div>

            <p className="text-sm font-black">
              Start a practice test
            </p>

            <p className="mt-1 text-xs font-medium text-white/70">
              Earn XP & keep your streak!
            </p>

            <div className="mt-3 flex items-center gap-1 text-xs font-black text-cyan transition-all group-hover:gap-2">
              Begin now
              <ArrowRight size={14} />
            </div>
          </Link>
        </motion.div>
      </div>

      {/* 
          STREAK BANNER
      */}

      {currentStreak > 0 && (
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.4,
          }}
          className="relative flex items-center gap-4 overflow-hidden rounded-2xl border-3 border-orange-300 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 p-5 shadow-hard"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-orange-200 bg-orange-100">
            <AnimatedFlame size={28} />
          </div>

          <div>
            <p className="text-base font-black text-navy">
              {currentStreak === 1
                ? "You just started your streak! 🔥"
                : currentStreak < 3
                  ? `${currentStreak} day streak! Keep it up! 🔥`
                  : `${currentStreak} day streak! You're on fire! 🔥🔥`}
            </p>

            <p className="mt-0.5 text-sm font-medium text-slate">
              Longest streak:{" "}
              {longestStreak} days. Don't break the chain!
            </p>
          </div>

          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 md:block"
          >
            <Trophy className="h-8 w-8 text-orange-300" />
          </motion.div>
        </motion.div>
      )}

      {/* 
          BAND PROGRESS + SKILLS
      */}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        {/* REAL DATABASE BAND DATA */}

        <motion.section
          initial={{
            opacity: 0,
            x: -20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 0.5,
          }}
          className="relative overflow-hidden rounded-2xl border-3 border-ink bg-white p-6 shadow-hard"
        >
          <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-teal to-cyan" />

          <h2 className="mb-5 font-display text-lg font-black tracking-tight text-navy dark:text-white">
            Band progress
          </h2>

          <BandProgressChart
            currentBand={student?.current_band ?? null}
            targetBand={student?.target_band ?? null}
          />
        </motion.section>

        {/* REAL SKILL DATA — latest graded band per skill,
            0 for any skill with no attempt yet */}

        <motion.section
          initial={{
            opacity: 0,
            x: 20,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            delay: 0.6,
          }}
          className="relative overflow-hidden rounded-2xl border-3 border-ink bg-white p-6 shadow-hard"
        >
          <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-navy to-teal" />

          <h2 className="mb-5 font-display text-lg font-black tracking-tight text-navy dark:text-white">
            Skills breakdown
          </h2>

          <SkillProgress
            bands={resolvedSkillBands}
          />
        </motion.section>
      </div>

      {/* 
          YOUR COURSES
          REAL DATABASE DATA
      */}

      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-black tracking-tight text-navy dark:text-white">
            Your courses
          </h2>

          <Link
            href="/learning"
            className="text-sm font-black text-teal transition-colors hover:text-teal-deep"
          >
            View all lessons →
          </Link>
        </div>

        {views.length === 0 ? (
          <div className="rounded-2xl border-3 border-dashed border-mist bg-paper p-8 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-mist">
              <BookIcon
                size={24}
                className="text-slate"
              />
            </div>

            <p className="text-sm font-black text-slate">
              No courses yet.
            </p>

            <p className="mt-1 text-xs font-medium text-slate-soft">
              Ask your teacher to enroll you in a course.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {views.map(({ course, contents }) => (
              <Link
                key={course.courseid}
                href="/learning"
                className="group relative overflow-hidden rounded-2xl border-3 border-ink bg-white p-5 shadow-hard transition-all hover:-translate-y-0.5 hover:border-teal/30 hover:shadow-brutalist"
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-teal to-cyan opacity-0 transition-opacity group-hover:opacity-100" />

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base font-black text-ink dark:text-white">
                      {course.title}
                    </p>

                    <p className="mt-1 text-sm text-slate">
                      {contents.length} lesson
                      {contents.length === 1 ? "" : "s"}

                      {course.level
                        ? ` · ${course.level}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-mist transition-colors group-hover:bg-teal/10">
                    <ArrowRight
                      size={18}
                      className="text-slate transition-colors group-hover:text-teal"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
