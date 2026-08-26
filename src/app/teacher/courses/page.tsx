import { createClient } from "@/lib/supabase/server";
import { CourseService } from "@/lib/services/course-service";
import { ContentRepository } from "@/lib/repositories/content.repository";
import { getCurrentTeacherId } from "@/lib/auth/current-user";
import { BookIcon, PeopleIcon } from "@/components/icons/stat-icons";
import { StaggerGroup, StaggerItem } from "@/components/ui/stagger-group";

export default async function TeacherCoursesPage() {
  const teacherid = await getCurrentTeacherId();
  if (!teacherid) {
    return <p className="text-sm text-slate">You need a teacher account to view this page.</p>;
  }

  const supabase = await createClient();
  const service = new CourseService(supabase);
  const contentRepo = new ContentRepository(supabase);
  const courses = await service.getTeacherCourses(teacherid);

  const stats = await Promise.all(
    courses.map(async (course) => {
      const [contents, { count: studentCount }] = await Promise.all([
        contentRepo.findByCourse(course.courseid),
        supabase
          .from("enrollments")
          .select("enrollid", { count: "exact", head: true })
          .eq("courseid", course.courseid)
          .eq("status", "active"),
      ]);
      return { course, lessonCount: contents.length, studentCount: studentCount ?? 0 };
    })
  );

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Your Courses</h1>
      {stats.length === 0 ? (
        <p className="text-sm text-slate-soft">No courses assigned to you yet.</p>
      ) : (
        <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map(({ course, lessonCount, studentCount }) => (
            <StaggerItem key={course.courseid}>
              <div className="flex h-full flex-col gap-3 rounded-lg border border-mist bg-surface p-5 shadow-card transition-transform hover:-translate-y-0.5">
                <div>
                  <p className="text-sm font-semibold text-ink">{course.title}</p>
                  <p className="mt-1 text-xs text-slate-soft">
                    {course.level ?? "—"} · {course.duration ?? "—"}
                  </p>
                </div>
                <div className="flex items-center gap-4 border-t border-mist pt-3 text-xs text-slate">
                  <span className="flex items-center gap-1.5">
                    <BookIcon size={16} className="text-teal" /> {lessonCount} lesson{lessonCount === 1 ? "" : "s"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <PeopleIcon size={16} className="text-navy dark:text-white" /> {studentCount} student
                    {studentCount === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
