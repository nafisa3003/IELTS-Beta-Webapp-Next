import { createClient } from "@/lib/supabase/server";
import { getCurrentStudentId } from "@/lib/auth/current-user";
import { EnrollmentRepository } from "@/lib/repositories/enrollment.repository";
import { LiveClassRepository } from "@/lib/repositories/live-class.repository";
import { CalendarIcon } from "@/components/icons/stat-icons";
import { EmptyState } from "@/components/ui/empty-state";

export default async function StudentLiveClassesPage() {
  const studentid = await getCurrentStudentId();
  if (!studentid) {
    return <p className="text-sm text-slate">You need a student account to view this page.</p>;
  }

  const supabase = await createClient();
  const enrollments = await new EnrollmentRepository(supabase).findByStudent(studentid);
  const courseIds = enrollments.filter((e) => e.status === "active").map((e) => e.courseid);

  const classes = await new LiveClassRepository(supabase).findByCourseIds(courseIds);
  const sorted = [...classes].sort((a, b) => new Date(a.class_date).getTime() - new Date(b.class_date).getTime());
  const now = Date.now();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Live Classes</h1>

      {sorted.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon size={28} />}
          title="No live classes scheduled"
          body="When your teacher schedules a live class, it'll show up here."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {sorted.map((c) => {
            const upcoming = new Date(c.class_date).getTime() >= now;
            return (
              <li key={c.classid} className="flex items-center gap-3 rounded-md border border-mist bg-surface px-4 py-3 text-sm">
                <CalendarIcon size={18} className={upcoming ? "shrink-0 text-teal" : "shrink-0 text-slate-soft"} />
                <div className="flex-1">
                  <p className="text-ink">{c.courseTitle}</p>
                  <p className="text-xs text-slate-soft">{new Date(c.class_date).toLocaleString()}</p>
                </div>
                {upcoming ? (
                  <span className="rounded-pill bg-teal/10 px-2.5 py-0.5 text-xs font-semibold text-teal">Upcoming</span>
                ) : (
                  <span className="rounded-pill bg-mist px-2.5 py-0.5 text-xs font-medium text-slate-soft">Past</span>
                )}
                {upcoming && (
                  <a href={c.meeting_link} className="font-medium text-teal" target="_blank" rel="noreferrer">
                    Join
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
