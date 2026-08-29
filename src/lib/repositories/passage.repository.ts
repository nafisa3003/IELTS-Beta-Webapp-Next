import type { SupabaseClient } from "@supabase/supabase-js";
import type { Passage } from "@/types/assessment";

export class PassageRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByTest(testid: string): Promise<Passage[]> {
    const { data, error } = await this.db
      .from("passages")
      .select("*")
      .eq("testid", testid)
      .order("order_index", { ascending: true });
    if (error) throw error;
    return data as Passage[];
  }

  async create(input: Pick<Passage, "testid" | "title" | "passage_text" | "order_index">): Promise<Passage> {
    const { data, error } = await this.db.from("passages").insert(input).select().single();
    if (error) throw error;
    return data as Passage;
  }

  async update(passageid: string, input: Partial<Pick<Passage, "title" | "passage_text" | "order_index">>): Promise<Passage> {
    const { data, error } = await this.db.from("passages").update(input).eq("passageid", passageid).select().single();
    if (error) throw error;
    return data as Passage;
  }

  async delete(passageid: string): Promise<void> {
    const { error } = await this.db.from("passages").delete().eq("passageid", passageid);
    if (error) throw error;
  }
}
