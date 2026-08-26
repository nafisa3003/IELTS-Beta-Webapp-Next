import { createClient } from "@/lib/supabase/server";
import { getCurrentTeacherId } from "@/lib/auth/current-user";
import { PeopleIcon, TrendIcon, BookIcon, CalendarIcon } from "@/components/icons/stat-icons";

interface RecentActivityRow {
  attemptid: string;
  studentName: string;
  testTitle: string;
  band: number | null;
  when: string;
}

export default async function TeacherHomePage() {
  const teacherid = await getCurrentTeacherId();
  if (!teacherid) {
    return <p className="text-sm text-slate">You need a teacher account to view this page.</p>;
  }

  const supabase = await createClient();
  const { data: teacherCourseRows } = await supabase
    .from("teacher_courses")
    .select("teachercourseid, courseid, courses(title)")
    .eq("teacherid", teacherid)
    .eq("is_active", true);

  const teacherCourses = teacherCourseRows ?? [];
  const courseIds = teacherCourses.map((tc) => tc.courseid as string);
  const teacherCourseIds = teacherCourses.map((tc) => tc.teachercourseid as string);

  let studentCount = 0;
  let avgBand: number | null = null;
  let recentActivity: RecentActivityRow[] = [];

  if (courseIds.length > 0) {
    const { data: activeEnrollments, count } = await supabase
      .from("enrollments")
      .select("studentid, students(current_band, userid, users(persons(first_name, last_name)))", { count: "exact" })
      .in("courseid", courseIds)
      .eq("status", "active");

    studentCount = count ?? 0;
    const studentIds = Array.from(new Set((activeEnrollments ?? []).map((e) => e.studentid as string)));

    const bands = (activeEnrollments ?? [])
      .map((e) => (e.students as unknown as { current_band: number | null } | null)?.current_band)
      .filter((b): b is number => b != null);
    avgBand = bands.length > 0 ? bands.reduce((a, b) => a + b, 0) / bands.length : null;

    if (studentIds.length > 0) {
      const { data: attempts } = await supabase
        .from("test_attempts")
        .select(
          "attemptid, submit_time, band_score, students(userid, users(persons(first_name, last_name))), practice_tests(title)"
        )
        .in("studentid", studentIds)
        .not("submit_time", "is", null)
        .order("submit_time", { ascending: false })
        .limit(6);

      recentActivity = (attempts ?? []).map((a) => {
        const row = a as unknown as {
          attemptid: string;
          submit_time: string;
          band_score: number | null;
          students: { users: { persons: { first_name: string; last_name: string } | null } | null } | null;
          practice_tests: { title: string } | null;
        };
        const person = row.students?.users?.persons;
        return {
          attemptid: row.attemptid,
          studentName: person ? `${person.first_name} ${person.last_name}` : "Student",
          testTitle: row.practice_tests?.title ?? "Practice test",
          band: row.band_score,
          when: row.submit_time,
        };
      });
    }
  }

  let nextClass: { class_date: string; meeting_link: string; courseTitle: string } | null = null;
  if (teacherCourseIds.length > 0) {
    const { data: upcoming } = await supabase
      .from("live_classes")
      .select("class_date, meeting_link, teacher_courses(courses(title))")
      .in("teachercourseid", teacherCourseIds)
      .gte("class_date", new Date().toISOString())
      .order("class_date", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (upcoming) {
      const row = upcoming as unknown as {
        class_date: string;
        meeting_link: string;
        teacher_courses: { courses: { title: string } | null } | null;
      };
      nextClass = {
        class_date: row.class_date,
        meeting_link: row.meeting_link,
        courseTitle: row.teacher_courses?.courses?.title ?? "your course",
      };
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Teacher Portal</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatCard icon={<PeopleIcon size={22} />} label="Total students" value={studentCount} accent="text-navy" />
        <StatCard icon={<BookIcon size={22} />} label="Active courses" value={courseIds.length} accent="text-teal" />
        <StatCard
          icon={<TrendIcon size={22} />}
          label="Avg. class band"
          value={avgBand != null ? avgBand.toFixed(1) : "—"}
          accent="text-xp"
        />
      </div>

      {nextClass && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-navy p-6 text-white shadow-card">
          <div className="flex items-center gap-3">
            <CalendarIcon size={24} className="shrink-0 text-teal" />
            <div>
              <p className="text-xs uppercase tracking-wide text-white/70">Upcoming live class</p>
              <p className="text-sm font-semibold">
                {nextClass.courseTitle} · {new Date(nextClass.class_date).toLocaleString()}
              </p>
            </div>
          </div>
          <a
            href={nextClass.meeting_link}
            target="_blank"
            rel="noreferrer"
            className="rounded-pill bg-teal px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Start session →
          </a>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <a href="/teacher/courses" className="rounded-lg border border-mist bg-surface p-4 transition-colors hover:border-teal">
          <p className="text-sm font-semibold text-ink">Courses</p>
          <p className="mt-1 text-xs text-slate-soft">View and manage your assigned courses</p>
        </a>
        <a href="/teacher/students" className="rounded-lg border border-mist bg-surface p-4 transition-colors hover:border-teal">
          <p className="text-sm font-semibold text-ink">Students</p>
          <p className="mt-1 text-xs text-slate-soft">See who's enrolled and their band scores</p>
        </a>
        <a href="/teacher/live-classes" className="rounded-lg border border-mist bg-surface p-4 transition-colors hover:border-teal">
          <p className="text-sm font-semibold text-ink">Live Classes</p>
          <p className="mt-1 text-xs text-slate-soft">Schedule and manage live sessions</p>
        </a>
      </div>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Recent student activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-slate-soft">No submitted attempts yet.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-mist bg-surface shadow-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-mist text-left text-xs uppercase tracking-wide text-slate-soft">
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Activity</th>
                  <th className="px-4 py-3 font-medium">Result</th>
                  <th className="px-4 py-3 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((row) => (
                  <tr key={row.attemptid} className="border-b border-mist last:border-0">
                    <td className="px-4 py-3 text-ink">{row.studentName}</td>
                    <td className="px-4 py-3 text-slate">{row.testTitle}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-pill bg-mist px-2.5 py-0.5 text-xs font-semibold text-navy">
                        {row.band != null ? `Band ${row.band.toFixed(1)}` : "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-soft">{new Date(row.when).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="rounded-lg bg-surface p-5 shadow-card">
      <div className="mb-2">{icon}</div>
      <p className="text-xs text-slate-soft">{label}</p>
      <p className={`font-display text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
