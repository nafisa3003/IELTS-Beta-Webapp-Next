import type { SupabaseClient } from "@supabase/supabase-js";
import type { CourseBatch } from "@/types/courses";

export class CourseBatchRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByCourse(courseid: string): Promise<CourseBatch[]> {
    const { data, error } = await this.db
      .from("course_batches")
      .select("*")
      .eq("courseid", courseid)
      .order("batch_number", { ascending: false });
    if (error) throw error;
    return data as CourseBatch[];
  }

  /** Active batches across every course — used to compute real enrollment-urgency CTAs. */
  async findAllActive(): Promise<CourseBatch[]> {
    const { data, error } = await this.db.from("course_batches").select("*").eq("is_active", true);
    if (error) throw error;
    return data as CourseBatch[];
  }

  async nextBatchNumber(courseid: string): Promise<number> {
    const { data, error } = await this.db
      .from("course_batches")
      .select("batch_number")
      .eq("courseid", courseid)
      .order("batch_number", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return (data?.batch_number ?? 0) + 1;
  }

  async create(input: {
    courseid: string;
    batch_number: number;
    batch_code: string;
    starts_on: string | null;
    seats_total: number | null;
    enrollment_deadline: string | null;
  }): Promise<CourseBatch> {
    const { data, error } = await this.db.from("course_batches").insert(input).select().single();
    if (error) throw error;
    return data as CourseBatch;
  }

  async deactivate(batchid: string): Promise<void> {
    const { error } = await this.db.from("course_batches").update({ is_active: false }).eq("batchid", batchid);
    if (error) throw error;
  }

  /** Active-enrollment count for one batch — the real number behind "X seats left". */
  async enrolledCount(batchid: string): Promise<number> {
    const { count, error } = await this.db
      .from("enrollments")
      .select("enrollid", { count: "exact", head: true })
      .eq("batchid", batchid)
      .eq("status", "active");
    if (error) throw error;
    return count ?? 0;
  }
}
