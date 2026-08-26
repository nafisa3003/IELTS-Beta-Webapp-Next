import type { SupabaseClient } from "@supabase/supabase-js";
import type { TestResult, Skill } from "@/types/assessment";

export class TestResultRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByAttempt(attemptid: string): Promise<TestResult | null> {
    const { data, error } = await this.db
      .from("test_results")
      .select("*")
      .eq("attemptid", attemptid)
      .maybeSingle();
    if (error) throw error;
    return data as TestResult | null;
  }

  /**
   * Latest graded result per skill for a student, most recent attempt first.
   * Used by the dashboard's skill charts — one row can carry multiple
   * skills (a full mock test), so we scan attempts newest-first and keep
   * the first non-null value seen for each skill.
   */
  async findLatestSkillBandsForStudent(
    studentid: string
  ): Promise<Partial<Record<Skill, number>>> {
    const { data, error } = await this.db
      .from("test_results")
      .select("listening, reading, writing, speaking, test_attempts!inner(studentid, submit_time)")
      .eq("test_attempts.studentid", studentid)
      .order("submit_time", { referencedTable: "test_attempts", ascending: false });
    if (error) throw error;

    const latest: Partial<Record<Skill, number>> = {};
    for (const row of (data ?? []) as unknown as Record<Skill | "test_attempts", number | null>[]) {
      for (const skill of ["Listening", "Reading", "Writing", "Speaking"] as Skill[]) {
        if (latest[skill] == null && row[skill] != null) {
          latest[skill] = row[skill] as number;
        }
      }
    }
    return latest;
  }

  async create(
    attemptid: string,
    bandBySkill: Partial<Record<Skill, number>>,
    overallBand: number
  ): Promise<TestResult> {
    const { data, error } = await this.db
      .from("test_results")
      .insert({
        attemptid,
        overall_band: overallBand,
        listening: bandBySkill.Listening ?? null,
        reading: bandBySkill.Reading ?? null,
        writing: bandBySkill.Writing ?? null,
        speaking: bandBySkill.Speaking ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return data as TestResult;
  }
}
