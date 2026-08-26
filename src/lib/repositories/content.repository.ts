import type { SupabaseClient } from "@supabase/supabase-js";
import type { Content } from "@/types/courses";

export class ContentRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByCourse(courseid: string): Promise<Content[]> {
    const { data, error } = await this.db
      .from("contents")
      .select("*")
      .eq("courseid", courseid)
      .order("created_at");
    if (error) throw error;
    return data as Content[];
  }

  async create(
    input: Pick<Content, "courseid" | "title" | "content_type" | "youtube_link" | "file_url">
  ): Promise<Content> {
    const { data, error } = await this.db.from("contents").insert(input).select().single();
    if (error) throw error;
    return data as Content;
  }

  async update(
    contentid: string,
    input: Partial<Pick<Content, "title" | "content_type" | "youtube_link" | "file_url">>
  ): Promise<Content> {
    const { data, error } = await this.db.from("contents").update(input).eq("contentid", contentid).select().single();
    if (error) throw error;
    return data as Content;
  }

  async delete(contentid: string): Promise<void> {
    const { error } = await this.db.from("contents").delete().eq("contentid", contentid);
    if (error) throw error;
  }
}
