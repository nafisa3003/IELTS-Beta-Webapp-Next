import type { SupabaseClient } from "@supabase/supabase-js";
import { CourseRepository } from "@/lib/repositories/course.repository";
import { ContentRepository } from "@/lib/repositories/content.repository";
import { EnrollmentRepository } from "@/lib/repositories/enrollment.repository";
import { TeacherCourseRepository } from "@/lib/repositories/teacher-course.repository";
import type { Course, Content, Enrollment } from "@/types/courses";

export interface StudentCourseView {
  enrollid: string;
  course: Course;
  contents: Content[];
}

/**
 * Facade over the Courses domain. Route handlers and server components
 * talk to this one class instead of four separate repositories.
 */
export class CourseService {
  private courses: CourseRepository;
  private contents: ContentRepository;
  private enrollments: EnrollmentRepository;
  private teacherCourses: TeacherCourseRepository;

  constructor(db: SupabaseClient) {
    this.courses = new CourseRepository(db);
    this.contents = new ContentRepository(db);
    this.enrollments = new EnrollmentRepository(db);
    this.teacherCourses = new TeacherCourseRepository(db);
  }

  /** Everything a student's /learning page needs, in one call. */
  async getStudentLearningView(studentid: string): Promise<StudentCourseView[]> {
    const enrollments = await this.enrollments.findByStudent(studentid);
    const active = enrollments.filter((e) => e.status === "active");

    const views = await Promise.all(
      active.map(async (e) => {
        const course = await this.courses.findById(e.courseid);
        const contents = course ? await this.contents.findByCourse(course.courseid) : [];
        return { enrollid: e.enrollid, course: course as Course, contents };
      })
    );
    return views;
  }

  async browseAvailableCourses(): Promise<Course[]> {
    return this.courses.findAll();
  }

  async enrollStudent(studentid: string, courseid: string, batchid?: string | null) {
    return this.enrollments.enroll(studentid, courseid, batchid);
  }

  /** Everything a teacher's /teacher/courses page needs. */
  async getTeacherCourses(teacherid: string) {
    const links = await this.teacherCourses.findByTeacher(teacherid);
    const courses = await Promise.all(
      links.map((l) => this.courses.findById(l.courseid))
    );
    return courses.filter((c): c is Course => c !== null);
  }

  async createCourse(input: Pick<Course, "title" | "description" | "level" | "duration">) {
    return this.courses.create(input);
  }

  async updateCourse(courseid: string, input: Partial<Pick<Course, "title" | "description" | "level" | "duration">>) {
    return this.courses.update(courseid, input);
  }

  async deleteCourse(courseid: string) {
    return this.courses.delete(courseid);
  }

  /** Everything the admin course-management panel needs for one course. */
  async getCourseManagementDetail(courseid: string) {
    const [teacherLinks, enrollments] = await Promise.all([
      this.teacherCourses.findByCourse(courseid),
      this.enrollments.findByCourse(courseid),
    ]);
    return { teacherLinks, enrollments };
  }

  async assignTeacherToCourse(teacherid: string, courseid: string) {
    return this.teacherCourses.assign(teacherid, courseid);
  }

  async unassignTeacherFromCourse(teachercourseid: string) {
    return this.teacherCourses.deactivate(teachercourseid);
  }

  async updateEnrollmentStatus(enrollid: string, status: Enrollment["status"]) {
    return this.enrollments.updateStatus(enrollid, status);
  }

  /** Courses a student isn't already enrolled in — for the self-enroll picker on /learning. */
  async browseUnenrolledCourses(studentid: string): Promise<Course[]> {
    const [all, mine] = await Promise.all([this.courses.findAll(), this.enrollments.findByStudent(studentid)]);
    const activeCourseIds = new Set(mine.filter((e) => e.status === "active").map((e) => e.courseid));
    return all.filter((c) => !activeCourseIds.has(c.courseid));
  }

  async dropEnrollment(enrollid: string) {
    return this.enrollments.drop(enrollid);
  }
}
