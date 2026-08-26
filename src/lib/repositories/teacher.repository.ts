import type { SupabaseClient } from "@supabase/supabase-js";

export interface TeacherOption {
  teacherid: string;
  name: string;
}

export class TeacherRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findAllForPicker(): Promise<TeacherOption[]> {
    const { data, error } = await this.db
      .from("teachers")
      .select("teacherid, users(persons(first_name, last_name))");
    if (error) throw error;
    return (data ?? []).map((row) => {
      const r = row as unknown as {
        teacherid: string;
        users: { persons: { first_name: string; last_name: string } | null } | null;
      };
      const person = r.users?.persons;
      return { teacherid: r.teacherid, name: person ? `${person.first_name} ${person.last_name}` : "Unnamed teacher" };
    });
  }
}
