import type { SupabaseClient } from "@supabase/supabase-js";
import type { Enrollment } from "@/types/courses";

export interface EnrollmentWithStudentName extends Enrollment {
  student_name: string;
}

export class EnrollmentRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByStudent(studentid: string): Promise<Enrollment[]> {
    const { data, error } = await this.db
      .from("enrollments")
      .select("*")
      .eq("studentid", studentid)
      .order("enroll_date", { ascending: false });
    if (error) throw error;
    return data as Enrollment[];
  }

  /** All enrollments for one course, with the student's name — for the admin course-management panel. */
  async findByCourse(courseid: string): Promise<EnrollmentWithStudentName[]> {
    const { data, error } = await this.db
      .from("enrollments")
      .select("enrollid, studentid, courseid, status, enroll_date, students(users(persons(first_name, last_name)))")
      .eq("courseid", courseid)
      .order("enroll_date", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => {
      const r = row as unknown as {
        enrollid: string;
        studentid: string;
        courseid: string;
        batchid?: string | null;
        status: "active" | "completed" | "dropped";
        enroll_date: string;
        students?: { full_name: string } | null;
      };
      return {
        enrollid: r.enrollid,
        studentid: r.studentid,
        courseid: r.courseid,
        batchid: r.batchid ?? null,
        status: r.status,
        enroll_date: r.enroll_date,
        student_name: r.students?.full_name ?? "Unknown",
      };
    });
  }

  async findStudentIdByUserId(userid: string): Promise<string | null> {
  const { data, error } = await this.db
    .from("students")
    .select("studentid")
    .eq("userid", userid)
    .maybeSingle();

  if (error) throw error;
  return data?.studentid ?? null;
}

  async enroll(studentid: string, courseid: string, batchid?: string | null): Promise<Enrollment> {
    // unique(studentid, courseid) means a student who previously dropped and
    // re-enrolls would hit a conflict on plain insert — upsert flips status
    // back to 'active' and refreshes enroll_date instead of erroring.
    const { data, error } = await this.db
      .from("enrollments")
      .upsert(
        { studentid, courseid, status: "active", enroll_date: new Date().toISOString(), batchid: batchid ?? null },
        { onConflict: "studentid,courseid" }
      )
      .select()
      .single();
    if (error) throw error;
    return data as Enrollment;
  }

  async updateStatus(enrollid: string, status: Enrollment["status"]): Promise<Enrollment> {
    const { data, error } = await this.db
      .from("enrollments")
      .update({ status })
      .eq("enrollid", enrollid)
      .select()
      .single();
    if (error) throw error;
    return data as Enrollment;
  }

  /** Student self-service drop — sets status to 'dropped' rather than deleting the row,
   * so TEST_ATTEMPTS taken under this enrollment stay meaningful history. */
  async drop(enrollid: string): Promise<void> {
    const { error } = await this.db.from("enrollments").update({ status: "dropped" }).eq("enrollid", enrollid);
    if (error) throw error;
  }
}
