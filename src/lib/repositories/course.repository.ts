import type { SupabaseClient } from "@supabase/supabase-js";
import type { Course } from "@/types/courses";

export class CourseRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findAll(): Promise<Course[]> {
    const { data, error } = await this.db.from("courses").select("*").order("created_at");
    if (error) throw error;
    return data as Course[];
  }

  async findById(courseid: string): Promise<Course | null> {
    const { data, error } = await this.db
      .from("courses")
      .select("*")
      .eq("courseid", courseid)
      .maybeSingle();
    if (error) throw error;
    return data as Course | null;
  }

  async create(input: Pick<Course, "title" | "description" | "level" | "duration">): Promise<Course> {
    const { data, error } = await this.db.from("courses").insert(input).select().single();
    if (error) throw error;
    return data as Course;
  }

  async update(courseid: string, input: Partial<Course>): Promise<Course> {
    const { data, error } = await this.db
      .from("courses")
      .update(input)
      .eq("courseid", courseid)
      .select()
      .single();
    if (error) throw error;
    return data as Course;
  }

  async delete(courseid: string): Promise<void> {
    const { error } = await this.db.from("courses").delete().eq("courseid", courseid);
    if (error) throw error;
  }
}
