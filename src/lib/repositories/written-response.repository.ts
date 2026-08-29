import type { SupabaseClient } from "@supabase/supabase-js";
import type { WrittenResponse } from "@/types/assessment";

export class WrittenResponseRepository {
  constructor(private readonly db: SupabaseClient) {}

  async upsertMany(attemptid: string, entries: { questionid: string; answer_text: string }[]): Promise<void> {
    if (entries.length === 0) return;
    const { error } = await this.db
      .from("written_responses")
      .upsert(entries.map((e) => ({ attemptid, ...e })), { onConflict: "attemptid,questionid" });
    if (error) throw error;
  }

  async findByAttempt(attemptid: string): Promise<WrittenResponse[]> {
    const { data, error } = await this.db.from("written_responses").select("*").eq("attemptid", attemptid);
    if (error) throw error;
    return data as WrittenResponse[];
  }
}
