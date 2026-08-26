import type { SupabaseClient } from "@supabase/supabase-js";
import type { VocabWord, CustomCard } from "@/types/vocab";

export class VocabRepository {
  constructor(private readonly db: SupabaseClient) {}

  /** Full word bank, alphabetical — used to power the client-side search/filter UI. */
  async findAllWords(): Promise<VocabWord[]> {
    const { data, error } = await this.db
      .from("vocab_words")
      .select("*")
      .order("word", { ascending: true })
      .limit(500);
    if (error) throw error;
    return data as VocabWord[];
  }

  async searchWords(query: string): Promise<VocabWord[]> {
    const { data, error } = await this.db
      .from("vocab_words")
      .select("*")
      .ilike("word", `%${query}%`)
      .order("word", { ascending: true })
      .limit(20);
    if (error) throw error;
    return data as VocabWord[];
  }

  async findSavedByUser(userid: string): Promise<VocabWord[]> {
    const { data, error } = await this.db
      .from("user_saved_words")
      .select("saved_at, vocab_words(*)")
      .eq("userid", userid)
      .order("saved_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row) => row.vocab_words as unknown as VocabWord);
  }

  async saveWord(userid: string, wordid: string): Promise<void> {
    const { error } = await this.db.from("user_saved_words").insert({ userid, wordid });
    if (error) throw error;
  }

  async unsaveWord(userid: string, wordid: string): Promise<void> {
    const { error } = await this.db
      .from("user_saved_words")
      .delete()
      .eq("userid", userid)
      .eq("wordid", wordid);
    if (error) throw error;
  }

  async findCustomCards(userid: string): Promise<CustomCard[]> {
    const { data, error } = await this.db
      .from("user_custom_cards")
      .select("*")
      .eq("userid", userid)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as CustomCard[];
  }

  async createCustomCard(
    userid: string,
    front: string,
    back: string,
    example: string | null,
    difficulty: string | null
  ): Promise<CustomCard> {
    const { data, error } = await this.db
      .from("user_custom_cards")
      .insert({ userid, front, back, example, difficulty })
      .select()
      .single();
    if (error) throw error;
    return data as CustomCard;
  }

  async updateCustomCard(
    cardid: string,
    updates: { front: string; back: string; example: string | null; difficulty: string | null }
  ): Promise<CustomCard> {
    const { data, error } = await this.db
      .from("user_custom_cards")
      .update(updates)
      .eq("cardid", cardid)
      .select()
      .single();
    if (error) throw error;
    return data as CustomCard;
  }

  async deleteCustomCard(cardid: string): Promise<void> {
    const { error } = await this.db.from("user_custom_cards").delete().eq("cardid", cardid);
    if (error) throw error;
  }
}