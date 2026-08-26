import type { SupabaseClient } from "@supabase/supabase-js";
import type { LiveClass } from "@/types/courses";

export class LiveClassRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByTeacherCourse(teachercourseid: string): Promise<LiveClass[]> {
    const { data, error } = await this.db
      .from("live_classes")
      .select("*")
      .eq("teachercourseid", teachercourseid)
      .order("class_date");
    if (error) throw error;
    return data as LiveClass[];
  }

  async create(input: Pick<LiveClass, "teachercourseid" | "meeting_link" | "class_date">): Promise<LiveClass> {
    const { data, error } = await this.db.from("live_classes").insert(input).select().single();
    if (error) throw error;
    return data as LiveClass;
  }

  async cancel(classid: string): Promise<void> {
    const { error } = await this.db.from("live_classes").delete().eq("classid", classid);
    if (error) throw error;
  }
}
