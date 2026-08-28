import type { SupabaseClient } from "@supabase/supabase-js";
import type { LiveClass } from "@/types/courses";

export interface LiveClassWithCourse extends LiveClass {
  courseTitle: string;
}

export interface LiveClassWithDetails extends LiveClass {
  courseTitle: string;
  teacherName: string;
}

export class LiveClassRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByTeacherCourse(teachercourseid: string): Promise<LiveClass[]> {
    const { data, error } = await this.db
      .from("live_classes")
      .select("*")
      .eq("teachercourseid", teachercourseid)
      .order("class_date");
    if (error) throw error;
    return data as LiveClass[];
  }

  /** Live classes across a set of courses, with course titles attached — for the student live-classes view. */
  async findByCourseIds(courseIds: string[]): Promise<LiveClassWithCourse[]> {
    if (courseIds.length === 0) return [];

    const { data: tcRows, error: tcError } = await this.db
      .from("teacher_courses")
      .select("teachercourseid, courses(title)")
      .in("courseid", courseIds)
      .eq("is_active", true);
    if (tcError) throw tcError;

    const tcIds = (tcRows ?? []).map((r) => r.teachercourseid as string);
    const titleByTc = new Map(
      (tcRows ?? []).map((r) => [
        r.teachercourseid as string,
        (r.courses as unknown as { title: string } | null)?.title ?? "Course",
      ])
    );
    if (tcIds.length === 0) return [];

    const { data, error } = await this.db
      .from("live_classes")
      .select("*")
      .in("teachercourseid", tcIds)
      .order("class_date");
    if (error) throw error;

    return (data as LiveClass[]).map((c) => ({
      ...c,
      courseTitle: titleByTc.get(c.teachercourseid) ?? "Course",
    }));
  }

  /** Every live class across the platform, with course + teacher names — for the admin oversight view. */
  async findAllWithDetails(): Promise<LiveClassWithDetails[]> {
    const { data, error } = await this.db
      .from("live_classes")
      .select("*, teacher_courses(courses(title), teachers(users(persons(first_name, last_name))))")
      .order("class_date", { ascending: false });
    if (error) throw error;

    return (data ?? []).map((row) => {
      const r = row as unknown as LiveClass & {
        teacher_courses: {
          courses: { title: string } | null;
          teachers: { users: { persons: { first_name: string; last_name: string } | null } | null } | null;
        } | null;
      };
      const person = r.teacher_courses?.teachers?.users?.persons;
      return {
        classid: r.classid,
        teachercourseid: r.teachercourseid,
        meeting_link: r.meeting_link,
        class_date: r.class_date,
        courseTitle: r.teacher_courses?.courses?.title ?? "Course",
        teacherName: person ? `${person.first_name} ${person.last_name}` : "Unknown teacher",
      };
    });
  }

  async create(input: Pick<LiveClass, "teachercourseid" | "meeting_link" | "class_date">): Promise<LiveClass> {
    const { data, error } = await this.db.from("live_classes").insert(input).select().single();
    if (error) throw error;
    return data as LiveClass;
  }

  async cancel(classid: string): Promise<void> {
    const { error } = await this.db.from("live_classes").delete().eq("classid", classid);
    if (error) throw error;
  }
}
