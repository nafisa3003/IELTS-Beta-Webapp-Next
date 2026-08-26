import { createClient } from "@/lib/supabase/server";
import { AssessmentService } from "@/lib/services/assessment-service";
import { getCurrentStudentId } from "@/lib/auth/current-user";
import type { Skill } from "@/types/assessment";
import { startAttemptAction } from "../actions";

const SKILL_LABEL: Record<string, Skill> = {
  listening: "Listening",
  reading: "Reading",
  writing: "Writing",
  speaking: "Speaking",
};

export default async function PracticeSkillPage({
  params,
}: {
  params: Promise<{ skill: string }>;
}) {
  const { skill: slug } = await params;
  const skill = SKILL_LABEL[slug];
  if (!skill) {
    return <p className="text-sm text-danger">Unknown skill.</p>;
  }

  const studentid = await getCurrentStudentId();
  if (!studentid) {
    return <p className="text-sm text-slate">You need a student account to view this page.</p>;
  }

  const supabase = await createClient();

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("courseid")
    .eq("studentid", studentid)
    .eq("status", "active");
  const courseIds = (enrollments ?? []).map((e) => e.courseid as string);

  const service = new AssessmentService(supabase);
  const tests = await service.listTestsForSkill(courseIds, skill);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">{skill} Practice</h1>
      {tests.length === 0 ? (
        <p className="text-sm text-slate-soft">
          No {skill.toLowerCase()} tests available in your enrolled courses yet.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {tests.map((t) => (
            <form key={t.testid} action={startAttemptAction.bind(null, t.testid)}>
              <button
                type="submit"
                className="flex w-full items-center justify-between rounded-md border border-mist bg-surface px-4 py-3 text-left transition-colors hover:border-teal"
              >
                <div>
                  <p className="text-sm font-medium text-ink">{t.title}</p>
                  <p className="text-xs text-slate-soft">
                    {t.category} · {t.duration} min · {t.total_marks} marks
                  </p>
                </div>
                <span className="text-xs font-semibold text-teal">Start →</span>
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
