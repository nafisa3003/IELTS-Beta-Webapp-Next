import type { SupabaseClient } from "@supabase/supabase-js";
import type { AnswerOptionPublic, AnswerOption } from "@/types/assessment";

export class AnswerOptionRepository {
  constructor(private readonly db: SupabaseClient) {}

  /** RLS-safe: never exposes is_correct. Used to render the test to a student. */
  async findPublicByQuestion(questionid: string): Promise<AnswerOptionPublic[]> {
    const { data, error } = await this.db
      .from("answer_options_public")
      .select("*")
      .eq("questionid", questionid);
    if (error) throw error;
    return data as AnswerOptionPublic[];
  }

  /**
   * Includes is_correct — RLS only allows admin/teacher on the base table,
   * so callers must pass a service-role client (see supabase/admin.ts).
   * Only ever call this from the scoring Strategy, server-side.
   */
  async findAllByTest(testid: string): Promise<AnswerOption[]> {
    const { data, error } = await this.db
      .from("answer_options")
      .select("optionid, questionid, option_text, is_correct, questions!inner(testid)")
      .eq("questions.testid", testid);
    if (error) throw error;
    return data as unknown as AnswerOption[];
  }

  /** Admin-only per RLS. Adds one option to a question. */
  async create(input: Pick<AnswerOption, "questionid" | "option_text" | "is_correct">): Promise<AnswerOption> {
    const { data, error } = await this.db.from("answer_options").insert(input).select().single();
    if (error) throw error;
    return data as AnswerOption;
  }

  /** Admin/teacher view of one question's options, including is_correct. */
  async findAllByQuestion(questionid: string): Promise<AnswerOption[]> {
    const { data, error } = await this.db
      .from("answer_options")
      .select("optionid, questionid, option_text, is_correct")
      .eq("questionid", questionid);
    if (error) throw error;
    return data as AnswerOption[];
  }

  async update(optionid: string, input: Partial<Pick<AnswerOption, "option_text" | "is_correct">>): Promise<AnswerOption> {
    const { data, error } = await this.db.from("answer_options").update(input).eq("optionid", optionid).select().single();
    if (error) throw error;
    return data as AnswerOption;
  }

  async delete(optionid: string): Promise<void> {
    const { error } = await this.db.from("answer_options").delete().eq("optionid", optionid);
    if (error) throw error;
  }
}
