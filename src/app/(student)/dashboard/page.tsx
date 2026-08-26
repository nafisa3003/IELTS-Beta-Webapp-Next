import { createClient } from "@/lib/supabase/server"
import { CourseService } from "@/lib/services/course-service"
import { GamificationRepository } from "@/lib/repositories/gamification.repository"
import { TestResultRepository } from "@/lib/repositories/test-result.repository"
import { getCurrentStudentId } from "@/lib/auth/current-user"
import { BandProgressChart } from "@/components/dashboard/band-progress-chart"
import { SkillProgress } from "@/components/dashboard/skill-progress"
import { XpGem } from "@/components/gamification/xp-gem"
import { AnimatedFlame } from "@/components/gamification/animated-flame"
import { BookIcon } from "@/components/icons/stat-icons"
import { ArrowRight, Target } from "lucide-react"
import { LevelBadge } from "@/components/gamification/level-badge"
import { StaggerGroup, StaggerItem } from "@/components/ui/stagger-group"
import Link from "next/link"

export default async function DashboardPage() {
  const studentid = await getCurrentStudentId()
  if (!studentid) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--mist)]">
            <BookIcon size={28} className="text-[var(--slate)]" />
          </div>
          <p className="text-lg font-semibold text-[var(--ink)]">You need a student account to view this page.</p>
          <p className="mt-2 text-sm text-[var(--slate)]">Ask your teacher to set you up as a student.</p>
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const courseService = new CourseService(supabase)
  const testResultRepo = new TestResultRepository(supabase)

  const [views, student, skillBands] = await Promise.all([
    courseService.getStudentLearningView(studentid),
    supabase
      .from("students")
      .select("current_band, target_band")
      .eq("studentid", studentid)
      .single()
      .then((r) => r.data as { current_band: number | null; target_band: number | null } | null),
    testResultRepo.findLatestSkillBandsForStudent(studentid),
  ])

  let xpTotal = 0
  let currentStreak = 0
  let longestStreak = 0
  let levelInfo = { level: 1, title: "Novice", currentXp: 0, xpForNextLevel: 100, progressPercent: 0 }

  if (user) {
    const gamification = new GamificationRepository(supabase)
    const stats = await gamification.getAllActivityStats(user.id)
    xpTotal = stats.xpTotal
    currentStreak = stats.streak?.current_streak ?? 0
    longestStreak = stats.streak?.longest_streak ?? 0
    levelInfo = stats.levelInfo

    await gamification.recordActivity(user.id, "daily_login")
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ===== WELCOME HEADER ===== */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-black tracking-tight text-[var(--navy)] dark:text-white sm:text-4xl">
            Welcome back
          </h1>
          <p className="text-base text-[var(--slate)]">
            {views.length > 0
              ? `You're enrolled in ${views.length} course${views.length > 1 ? "s" : ""}.`
              : "You're not enrolled in a course yet — ask your teacher to add you."}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border-2 border-[var(--mist)] bg-white px-5 py-3 shadow-[var(--shadow-card)] dark:border-slate/20 dark:bg-navy-deep">
          <LevelBadge level={levelInfo.level} title={levelInfo.title} size="sm" />
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-[var(--slate-soft)] uppercase tracking-wider">{levelInfo.title}</p>
            <div className="mt-1 h-2 w-28 overflow-hidden rounded-full bg-[var(--mist)] dark:bg-slate/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--teal)] to-[#78FFF9]"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== STATS GRID ===== */}
      <StaggerGroup className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StaggerItem>
          <StatCard
            icon={<XpGem size={24} className="animate-bounce-slow" />}
            label="Total XP"
            value={xpTotal}
            accent="text-[var(--navy)]"
            bg="bg-gradient-to-br from-[#78FFF9] to-[#F0FDFC]"
            border="border-[var(--teal)]/20"
            iconBg="bg-white/60"
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<AnimatedFlame size={24} />}
            label="Current streak"
            value={currentStreak}
            suffix="days"
            accent="text-[var(--navy)]"
            bg="bg-gradient-to-br from-orange-100 to-amber-50"
            border="border-orange-200"
            iconBg="bg-white/60"
            highlight={currentStreak > 0}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            icon={<BookIcon size={24} />}
            label="Courses"
            value={views.length}
            accent="text-white"
            bg="bg-[var(--navy)]"
            border="border-[var(--navy-deep)]"
            iconBg="bg-white/10"
            textLight
          />
        </StaggerItem>
        <StaggerItem>
          <Link
            href="/practice"
            className="group flex h-full flex-col justify-center rounded-2xl bg-gradient-to-br from-[var(--navy)] to-[var(--navy-deep)] p-5 text-white shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)] border-2 border-[var(--navy-deep)]"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
              <Target size={20} className="text-[#78FFF9]" />
            </div>
            <p className="text-sm font-bold">Start a practice test</p>
            <p className="mt-1 text-xs text-white/70">Earn XP & keep your streak!</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-[#78FFF9] transition-all group-hover:gap-2">
              Begin now <ArrowRight size={14} />
            </div>
          </Link>
        </StaggerItem>
      </StaggerGroup>

      {/* ===== STREAK BANNER ===== */}
      {currentStreak > 0 && (
        <div className="relative overflow-hidden rounded-2xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 p-5 flex items-center gap-4 shadow-[var(--shadow-card)]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100">
            <AnimatedFlame size={28} />
          </div>
          <div>
            <p className="text-base font-black text-[var(--navy)]">
              {currentStreak === 1
                ? "You just started your streak! 🔥"
                : currentStreak < 3
                ? `${currentStreak} day streak! Keep it up! 🔥`
                : `${currentStreak} day streak! You're on fire! 🔥🔥`}
            </p>
            <p className="text-sm text-[var(--slate)] mt-0.5">
              {currentStreak === 1
                ? "Come back tomorrow to keep it going."
                : `Longest streak: ${longestStreak} days. Don't break the chain!`}
            </p>
          </div>
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-100/50 blur-2xl" />
        </div>
      )}

      {/* ===== BAND PROGRESS + SKILLS ===== */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
        {/* Band Progress */}
        <section className="relative overflow-hidden rounded-2xl border-2 border-[var(--mist)] bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate/20 dark:bg-navy-deep">
          <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[var(--teal)] to-[#78FFF9]" />
          <h2 className="mb-5 font-display text-lg font-bold text-[var(--navy)] dark:text-white">
            Band progress
          </h2>
          <BandProgressChart currentBand={student?.current_band ?? null} targetBand={student?.target_band ?? null} />
        </section>

        {/* Skills Breakdown */}
        <section className="relative overflow-hidden rounded-2xl border-2 border-[var(--mist)] bg-white p-6 shadow-[var(--shadow-card)] dark:border-slate/20 dark:bg-navy-deep">
          <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[var(--navy)] to-[var(--teal)]" />
          <h2 className="mb-5 font-display text-lg font-bold text-[var(--navy)] dark:text-white">
            Skills breakdown
          </h2>
          <SkillProgress bands={skillBands} />
        </section>
      </div>

      {/* ===== YOUR COURSES ===== */}
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-display text-xl font-bold text-[var(--navy)] dark:text-white">
            Your courses
          </h2>
          <Link href="/learning" className="text-sm font-bold text-[var(--teal)] hover:text-[var(--teal-deep)] transition-colors">
            View all lessons →
          </Link>
        </div>
        {views.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[var(--mist)] bg-[var(--paper)] p-8 text-center dark:border-slate/20 dark:bg-navy-deep/50">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--mist)]">
              <BookIcon size={24} className="text-[var(--slate)]" />
            </div>
            <p className="text-sm font-semibold text-[var(--slate)]">No courses yet.</p>
            <p className="text-xs text-[var(--slate-soft)] mt-1">Ask your teacher to enroll you in a course.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {views.map(({ course, contents }) => (
              <Link
                key={course.courseid}
                href="/learning"
                className="group relative overflow-hidden rounded-2xl border-2 border-[var(--mist)] bg-white p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-[var(--teal)]/30 hover:shadow-[var(--shadow-float)] dark:border-slate/20 dark:bg-navy-deep"
              >
                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-[var(--teal)] to-[#78FFF9] opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-base font-bold text-[var(--ink)] dark:text-white">{course.title}</p>
                    <p className="mt-1 text-sm text-[var(--slate)]">
                      {contents.length} lesson{contents.length === 1 ? "" : "s"}
                      {course.level ? ` · ${course.level}` : ""}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--mist)] transition-colors group-hover:bg-[var(--teal)]/10">
                    <ArrowRight size={18} className="text-[var(--slate)] transition-colors group-hover:text-[var(--teal)]" />
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
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)] ${bg} ${border} ${
        highlight ? "ring-2 ring-orange-300" : ""
      }`}
    >
      <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
        {icon}
      </div>
      <p className={`text-xs font-bold uppercase tracking-wider ${textLight ? "text-white/70" : "text-[var(--slate)]"}`}>
        {label}
      </p>
      <p className={`font-display text-3xl font-black tracking-tight ${accent}`}>
        {value}
        {suffix && <span className={`ml-1 text-sm font-semibold ${textLight ? "text-white/70" : "text-[var(--slate)]"}`}>{suffix}</span>}
      </p>
    </div>
  )
}