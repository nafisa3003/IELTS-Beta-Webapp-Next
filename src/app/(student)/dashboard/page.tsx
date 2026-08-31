import { createClient } from "@/lib/supabase/server"
import { CourseService } from "@/lib/services/course-service"
import { getCurrentStudentId } from "@/lib/auth/current-user"
import { GamificationRepository } from "@/lib/repositories/gamification.repository"
import { TestResultRepository } from "@/lib/repositories/test-result.repository"
import DashboardClient from "./dashboard-client"

export default async function DashboardPage() {
  const studentid = await getCurrentStudentId()

  if (!studentid) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--mist)]">
            <div className="h-7 w-7 rounded-lg bg-[var(--slate)]/20" />
          </div>

          <p className="text-lg font-semibold text-[var(--ink)]">
            You need a student account to view this page.
          </p>

          <p className="mt-2 text-sm text-[var(--slate)]">
            Ask your teacher to set you up as a student.
          </p>
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const courseService = new CourseService(supabase)
  const gamificationRepo = new GamificationRepository(supabase)
  const testResultRepo = new TestResultRepository(supabase)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [views, student, xpTotal, streak, skillBands] = await Promise.all([
    courseService.getStudentLearningView(studentid),

    supabase
      .from("students")
      .select("current_band, target_band")
      .eq("studentid", studentid)
      .single()
      .then(
        (result) =>
          result.data as {
            current_band: number | null
            target_band: number | null
          } | null,
      ),

    // XP/streak are keyed by userid (auth identity), not studentid —
    // same repository rewards/page.tsx already uses successfully.
    user ? gamificationRepo.getXpTotal(user.id) : Promise.resolve(0),
    user ? gamificationRepo.getStreak(user.id) : Promise.resolve(null),

    testResultRepo.findLatestSkillBandsForStudent(studentid),
  ])

  const levelInfo = gamificationRepo.getLevelInfo(xpTotal)

  return (
    <DashboardClient
      views={views}
      student={student}
      xpTotal={xpTotal}
      streak={streak}
      levelInfo={levelInfo}
      skillBands={skillBands}
    />
  )
}
