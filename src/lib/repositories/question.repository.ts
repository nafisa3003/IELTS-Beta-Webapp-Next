import type { SupabaseClient } from "@supabase/supabase-js";
import type { Question } from "@/types/assessment";

export class QuestionRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByTest(testid: string): Promise<Question[]> {
    const { data, error } = await this.db.from("questions").select("*").eq("testid", testid);
    if (error) throw error;
    return data as Question[];
  }

  async create(input: Pick<Question, "testid" | "question" | "skill" | "marks">): Promise<Question> {
    const { data, error } = await this.db.from("questions").insert(input).select().single();
    if (error) throw error;
    return data as Question;
  }

  async update(questionid: string, input: Partial<Pick<Question, "question" | "skill" | "marks">>): Promise<Question> {
    const { data, error } = await this.db.from("questions").update(input).eq("questionid", questionid).select().single();
    if (error) throw error;
    return data as Question;
  }

  async delete(questionid: string): Promise<void> {
    const { error } = await this.db.from("questions").delete().eq("questionid", questionid);
    if (error) throw error;
  }
}
