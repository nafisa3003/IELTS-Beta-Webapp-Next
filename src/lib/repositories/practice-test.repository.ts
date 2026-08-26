import type { SupabaseClient } from "@supabase/supabase-js";
import type { PracticeTest } from "@/types/assessment";

export class PracticeTestRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByCourse(courseid: string): Promise<PracticeTest[]> {
    const { data, error } = await this.db
      .from("practice_tests")
      .select("*")
      .eq("courseid", courseid);
    if (error) throw error;
    return data as PracticeTest[];
  }

  async findById(testid: string): Promise<PracticeTest | null> {
    const { data, error } = await this.db
      .from("practice_tests")
      .select("*")
      .eq("testid", testid)
      .maybeSingle();
    if (error) throw error;
    return data as PracticeTest | null;
  }

  async create(
    input: Pick<PracticeTest, "courseid" | "title" | "category" | "duration" | "total_marks">
  ): Promise<PracticeTest> {
    const { data, error } = await this.db.from("practice_tests").insert(input).select().single();
    if (error) throw error;
    return data as PracticeTest;
  }

  async update(
    testid: string,
    input: Partial<Pick<PracticeTest, "title" | "category" | "duration" | "total_marks">>
  ): Promise<PracticeTest> {
    const { data, error } = await this.db.from("practice_tests").update(input).eq("testid", testid).select().single();
    if (error) throw error;
    return data as PracticeTest;
  }

  async delete(testid: string): Promise<void> {
    const { error } = await this.db.from("practice_tests").delete().eq("testid", testid);
    if (error) throw error;
  }
}
