import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTeacherId } from "@/lib/auth/current-user";
import { CourseRepository } from "@/lib/repositories/course.repository";
import { ContentRepository } from "@/lib/repositories/content.repository";
import { TeacherCourseRepository } from "@/lib/repositories/teacher-course.repository";
import { BookIcon, PeopleIcon } from "@/components/icons/stat-icons";
import { EmptyState } from "@/components/ui/empty-state";
import { ArrowLeft } from "lucide-react";

export default async function TeacherCourseDetailPage({
  params,
}: {
  params: Promise<{ courseid: string }>;
}) {
  const { courseid } = await params;
  const teacherid = await getCurrentTeacherId();
  if (!teacherid) {
    return <p className="text-sm text-slate">You need a teacher account to view this page.</p>;
  }

  const supabase = await createClient();

  // Ownership check — only render if this course is actually assigned to this teacher.
  const teacherCourseRepo = new TeacherCourseRepository(supabase);
  const myLinks = await teacherCourseRepo.findByTeacher(teacherid);
  const owns = myLinks.some((l) => l.courseid === courseid);
  if (!owns) notFound();

  const courseRepo = new CourseRepository(supabase);
  const contentRepo = new ContentRepository(supabase);

  const [course, contents, { count: studentCount }] = await Promise.all([
    courseRepo.findById(courseid),
    contentRepo.findByCourse(courseid),
    supabase
      .from("enrollments")
      .select("enrollid", { count: "exact", head: true })
      .eq("courseid", courseid)
      .eq("status", "active"),
  ]);

  if (!course) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link href="/teacher/courses" className="flex items-center gap-1.5 text-sm font-medium text-slate hover:text-ink">
        <ArrowLeft size={16} /> Back to your courses
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">{course.title}</h1>
        <p className="text-sm text-slate">
          {course.level ?? "—"} · {course.duration ?? "—"}
          {course.course_code ? ` · ${course.course_code}` : ""}
        </p>
        {course.description && <p className="max-w-2xl text-sm text-slate">{course.description}</p>}
      </div>

      <div className="flex items-center gap-6 border-t border-mist pt-4 text-sm text-slate">
        <span className="flex items-center gap-1.5">
          <BookIcon size={16} className="text-teal" /> {contents.length} lesson{contents.length === 1 ? "" : "s"}
        </span>
        <span className="flex items-center gap-1.5">
          <PeopleIcon size={16} className="text-navy dark:text-white" /> {studentCount ?? 0} student
          {(studentCount ?? 0) === 1 ? "" : "s"}
        </span>
      </div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">Lessons</h2>
        {contents.length === 0 ? (
          <EmptyState icon={<BookIcon size={28} />} title="No lessons yet" body="Your admin hasn't added content to this course yet." />
        ) : (
          <ul className="flex flex-col gap-2">
            {contents.map((c) => (
              <li key={c.contentid} className="flex items-center gap-3 rounded-md border border-mist bg-surface px-4 py-3 text-sm">
                <BookIcon size={16} className="shrink-0 text-teal" />
                <span className="flex-1 text-ink">{c.title}</span>
                <span className="rounded-pill bg-mist px-2.5 py-0.5 text-xs font-medium text-slate-soft">
                  {c.content_type}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
