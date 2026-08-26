import { createClient } from "@/lib/supabase/server";
import { CourseService } from "@/lib/services/course-service";
import { ContentRepository } from "@/lib/repositories/content.repository";
import { CreateContentForm } from "./create-content-form";
import { ContentRow } from "./content-row";

export default async function AdminContentPage() {
  const supabase = await createClient();
  const courseService = new CourseService(supabase);
  const contentRepo = new ContentRepository(supabase);

  const courses = await courseService.browseAvailableCourses();
  const contentsByCourse = await Promise.all(
    courses.map(async (c) => ({ course: c, contents: await contentRepo.findByCourse(c.courseid) }))
  );

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Content</h1>

      {courses.length === 0 ? (
        <p className="text-sm text-slate-soft">Create a course first, then add content to it here.</p>
      ) : (
        <CreateContentForm courses={courses} />
      )}

      <div className="flex flex-col gap-6">
        {contentsByCourse.map(({ course, contents }) => (
          <section key={course.courseid}>
            <h2 className="mb-2 font-display text-lg font-semibold text-ink">{course.title}</h2>
            {contents.length === 0 ? (
              <p className="text-sm text-slate-soft">No content yet.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {contents.map((c) => (
                  <ContentRow key={c.contentid} content={c} />
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
