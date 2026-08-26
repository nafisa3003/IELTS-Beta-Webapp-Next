import type { SupabaseClient } from "@supabase/supabase-js";
import type { TeacherCourse } from "@/types/courses";

export interface TeacherCourseWithName extends TeacherCourse {
  teacher_name: string;
}

export class TeacherCourseRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByTeacher(teacherid: string): Promise<TeacherCourse[]> {
    const { data, error } = await this.db
      .from("teacher_courses")
      .select("*")
      .eq("teacherid", teacherid)
      .eq("is_active", true);
    if (error) throw error;
    return data as TeacherCourse[];
  }

  /** Active teacher assignments for one course, with the teacher's name — for the admin course-management panel. */
  async findByCourse(courseid: string): Promise<TeacherCourseWithName[]> {
    const { data, error } = await this.db
      .from("teacher_courses")
      .select("teachercourseid, teacherid, courseid, assigned_at, is_active, teachers(users(persons(first_name, last_name)))")
      .eq("courseid", courseid)
      .eq("is_active", true);
    if (error) throw error;
    return (data ?? []).map((row) => {
      const r = row as unknown as {
        teachercourseid: string;
        teacherid: string;
        courseid: string;
        assigned_at: string;
        is_active: boolean;
        teachers: { users: { persons: { first_name: string; last_name: string } | null } | null } | null;
      };
      const person = r.teachers?.users?.persons;
      return {
        teachercourseid: r.teachercourseid,
        teacherid: r.teacherid,
        courseid: r.courseid,
        assigned_at: r.assigned_at,
        is_active: r.is_active,
        teacher_name: person ? `${person.first_name} ${person.last_name}` : "Unknown teacher",
      };
    });
  }

  async assign(teacherid: string, courseid: string): Promise<TeacherCourse> {
    const { data, error } = await this.db
      .from("teacher_courses")
      .insert({ teacherid, courseid })
      .select()
      .single();
    if (error) throw error;
    return data as TeacherCourse;
  }

  /** Soft-remove — is_active=false rather than a hard delete, so live_classes
   * (FK'd to teachercourseid) never dangle. */
  async deactivate(teachercourseid: string): Promise<void> {
    const { error } = await this.db
      .from("teacher_courses")
      .update({ is_active: false })
      .eq("teachercourseid", teachercourseid);
    if (error) throw error;
  }
}

