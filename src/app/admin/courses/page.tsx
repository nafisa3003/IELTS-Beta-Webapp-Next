import { createClient } from "@/lib/supabase/server";
import { CourseService } from "@/lib/services/course-service";
import { TeacherRepository } from "@/lib/repositories/teacher.repository";
import { CourseBatchRepository } from "@/lib/repositories/course-batch.repository";
import { CreateCourseForm } from "./create-course-form";
import { CourseCard } from "./course-card";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const service = new CourseService(supabase);
  const teacherRepo = new TeacherRepository(supabase);
  const batchRepo = new CourseBatchRepository(supabase);

  const [courses, teachers] = await Promise.all([service.browseAvailableCourses(), teacherRepo.findAllForPicker()]);

  const details = await Promise.all(courses.map((c) => service.getCourseManagementDetail(c.courseid)));
  const batchesByCourse = await Promise.all(courses.map((c) => batchRepo.findByCourse(c.courseid)));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy dark:text-white">Courses</h1>
        <p className="text-sm text-slate">Create courses, assign teachers, and manage enrollment.</p>
      </div>

      <CreateCourseForm />

      <div className="flex flex-col gap-4">
        {courses.length === 0 && <p className="text-sm text-slate-soft">No courses yet — add one above.</p>}
        {courses.map((course, i) => (
          <CourseCard
            key={course.courseid}
            course={course}
            teacherLinks={details[i]?.teacherLinks ?? []}
            enrollments={details[i]?.enrollments ?? []}
            allTeachers={teachers}
            batches={batchesByCourse?.[i] ?? []}
          />
        ))}
      </div>
    </div>
  );
}
