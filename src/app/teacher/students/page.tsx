import { createClient } from "@/lib/supabase/server";
import { getCurrentTeacherId } from "@/lib/auth/current-user";
import { PeopleIcon, OnTrackIcon, TrendIcon } from "@/components/icons/stat-icons";
import { EmptyState } from "@/components/ui/empty-state";

interface StudentRow {
  studentid: string;
  target_band: number | null;
  current_band: number | null;
  persons: { first_name: string; last_name: string } | null;
  courseTitle: string;
}

export default async function TeacherStudentsPage() {
  const teacherid = await getCurrentTeacherId();
  if (!teacherid) {
    return <p className="text-sm text-slate">You need a teacher account to view this page.</p>;
  }

  const supabase = await createClient();

  const { data: teacherCourses } = await supabase
    .from("teacher_courses")
    .select("courseid, courses(title)")
    .eq("teacherid", teacherid)
    .eq("is_active", true);

  const courseIds = (teacherCourses ?? []).map((tc) => tc.courseid as string);
  const courseTitleById = new Map(
    (teacherCourses ?? []).map((tc) => [
      tc.courseid as string,
      (tc.courses as unknown as { title: string } | null)?.title ?? "Course",
    ])
  );

  let rows: StudentRow[] = [];
  if (courseIds.length > 0) {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("courseid, students(studentid, target_band, current_band, users(persons(first_name, last_name)))")
      .in("courseid", courseIds)
      .eq("status", "active");

    rows = (enrollments ?? []).map((e) => {
      const student = e.students as unknown as {
        studentid: string;
        target_band: number | null;
        current_band: number | null;
        users: { persons: { first_name: string; last_name: string } | null } | null;
      };
      return {
        studentid: student.studentid,
        target_band: student.target_band,
        current_band: student.current_band,
        persons: student.users?.persons ?? null,
        courseTitle: courseTitleById.get(e.courseid as string) ?? "Course",
      };
    });
  }

  const onTrackCount = rows.filter((r) => r.current_band != null && r.target_band != null && r.current_band >= r.target_band).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Your Students</h1>
        <div className="flex items-center gap-4 text-xs text-slate">
          <span className="flex items-center gap-1.5">
            <PeopleIcon size={16} className="text-navy dark:text-white" /> {rows.length} enrolled
          </span>
          <span className="flex items-center gap-1.5">
            <OnTrackIcon size={16} /> {onTrackCount} on track
          </span>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<PeopleIcon size={28} />} title="No students yet" body="Once students enroll in your courses, they'll show up here." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-mist bg-surface shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-mist text-xs uppercase text-slate-soft">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Current band</th>
                <th className="px-4 py-3">Target band</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const onTrack = r.current_band != null && r.target_band != null && r.current_band >= r.target_band;
                const gap = r.current_band != null && r.target_band != null ? r.target_band - r.current_band : null;
                return (
                  <tr key={`${r.studentid}-${r.courseTitle}`} className="border-t border-mist">
                    <td className="px-4 py-3 text-ink">
                      {r.persons ? `${r.persons.first_name} ${r.persons.last_name}` : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate">{r.courseTitle}</td>
                    <td className="px-4 py-3 text-slate">{r.current_band ?? "—"}</td>
                    <td className="px-4 py-3 text-slate">{r.target_band ?? "—"}</td>
                    <td className="px-4 py-3">
                      {r.current_band == null || r.target_band == null ? (
                        <span className="text-xs text-slate-soft">—</span>
                      ) : onTrack ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-success">
                          <OnTrackIcon size={14} /> On track
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-xp">
                          <TrendIcon size={14} /> {gap?.toFixed(1)} to go
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
