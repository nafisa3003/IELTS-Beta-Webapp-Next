import type { SupabaseClient } from "@supabase/supabase-js";
import type { TestAttempt } from "@/types/assessment";

export class TestAttemptRepository {
  constructor(private readonly db: SupabaseClient) {}

  async start(studentid: string, testid: string): Promise<TestAttempt> {
    const { data, error } = await this.db
      .from("test_attempts")
      .insert({ studentid, testid })
      .select()
      .single();
    if (error) throw error;
    return data as TestAttempt;
  }

  async findById(attemptid: string): Promise<TestAttempt | null> {
    const { data, error } = await this.db
      .from("test_attempts")
      .select("*")
      .eq("attemptid", attemptid)
      .maybeSingle();
    if (error) throw error;
    return data as TestAttempt | null;
  }

  async submit(attemptid: string, score: number, bandScore: number): Promise<TestAttempt> {
    const { data, error } = await this.db
      .from("test_attempts")
      .update({ submit_time: new Date().toISOString(), score, band_score: bandScore })
      .eq("attemptid", attemptid)
      .select()
      .single();
    if (error) throw error;
    return data as TestAttempt;
  }
}
