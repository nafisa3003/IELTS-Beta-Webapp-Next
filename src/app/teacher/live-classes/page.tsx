import { createClient } from "@/lib/supabase/server";
import { getCurrentTeacherId } from "@/lib/auth/current-user";
import { LiveClassRepository } from "@/lib/repositories/live-class.repository";
import { CalendarIcon } from "@/components/icons/stat-icons";
import { ScheduleClassForm, CancelClassButton } from "./live-class-controls";

export default async function TeacherLiveClassesPage() {
  const teacherid = await getCurrentTeacherId();
  if (!teacherid) {
    return <p className="text-sm text-slate">You need a teacher account to view this page.</p>;
  }

  const supabase = await createClient();
  const { data: teacherCourses } = await supabase
    .from("teacher_courses")
    .select("teachercourseid, courses(title)")
    .eq("teacherid", teacherid)
    .eq("is_active", true);

  const links = (teacherCourses ?? []).map((l) => ({
    teachercourseid: l.teachercourseid as string,
    courseTitle: (l.courses as unknown as { title: string } | null)?.title ?? "Course",
  }));

  const repo = new LiveClassRepository(supabase);
  const classesByLink = await Promise.all(
    links.map(async (l) => ({ ...l, classes: await repo.findByTeacherCourse(l.teachercourseid) }))
  );

  const now = Date.now();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Live Classes</h1>

      {links.length === 0 ? (
        <p className="text-sm text-slate-soft">You need an assigned course before scheduling a class.</p>
      ) : (
        <ScheduleClassForm links={links} />
      )}

      <div className="flex flex-col gap-6">
        {classesByLink.map(({ teachercourseid, courseTitle, classes }) => (
          <section key={teachercourseid}>
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">{courseTitle}</h2>
            {classes.length === 0 ? (
              <p className="text-sm text-slate-soft">No classes scheduled.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {classes.map((c) => {
                  const upcoming = new Date(c.class_date).getTime() >= now;
                  return (
                    <li
                      key={c.classid}
                      className="flex items-center gap-3 rounded-md border border-mist bg-surface px-4 py-3 text-sm"
                    >
                      <CalendarIcon size={18} className={upcoming ? "shrink-0 text-teal" : "shrink-0 text-slate-soft"} />
                      <span className="flex-1 text-ink">{new Date(c.class_date).toLocaleString()}</span>
                      {upcoming ? (
                        <span className="rounded-pill bg-teal/10 px-2.5 py-0.5 text-xs font-semibold text-teal">Upcoming</span>
                      ) : (
                        <span className="rounded-pill bg-mist px-2.5 py-0.5 text-xs font-medium text-slate-soft">Past</span>
                      )}
                      <a href={c.meeting_link} className="font-medium text-teal" target="_blank" rel="noreferrer">
                        Join link
                      </a>
                      <CancelClassButton classid={c.classid} />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
