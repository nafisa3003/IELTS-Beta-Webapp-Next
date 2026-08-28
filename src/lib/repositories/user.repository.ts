import type { SupabaseClient } from "@supabase/supabase-js";

export interface UserRow {
  userid: string;
  email: string;
  role: "student" | "teacher" | "admin";
  created_at: string;
  display_id: string | null;
  persons: { first_name: string; last_name: string } | null;
}

export class UserRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findAll(): Promise<UserRow[]> {
    const { data, error } = await this.db
      .from("users")
      .select(
        "userid, email, role, created_at, persons(first_name, last_name), students(display_id), teachers(display_id), admins(display_id)"
      )
      .order("created_at", { ascending: false });
    if (error) throw error;

    return (data ?? []).map((row) => {
      const r = row as unknown as {
        userid: string;
        email: string;
        role: UserRow["role"];
        created_at: string;
        persons: { first_name: string; last_name: string } | null;
        students: { display_id: string | null } | { display_id: string | null }[] | null;
        teachers: { display_id: string | null } | { display_id: string | null }[] | null;
        admins: { display_id: string | null } | { display_id: string | null }[] | null;
      };

      const pickDisplayId = (
        v: { display_id: string | null } | { display_id: string | null }[] | null
      ): string | null => {
        if (!v) return null;
        if (Array.isArray(v)) return v[0]?.display_id ?? null;
        return v.display_id ?? null;
      };

      return {
        userid: r.userid,
        email: r.email,
        role: r.role,
        created_at: r.created_at,
        persons: r.persons,
        display_id: pickDisplayId(r.students) ?? pickDisplayId(r.teachers) ?? pickDisplayId(r.admins),
      };
    });
  }

  async updateRole(userid: string, role: UserRow["role"], actingAdminId: string): Promise<void> {
    const { error } = await this.db.from("users").update({ role }).eq("userid", userid);
    if (error) throw error;

    const table = role === "student" ? "students" : role === "teacher" ? "teachers" : "admins";
    const { error: subtypeError } = await this.db.from(table).upsert({ userid }, { onConflict: "userid" });
    if (subtypeError) throw subtypeError;

    const { error: logError } = await this.db.from("admin_logs").insert({
      adminid: actingAdminId,
      action: "role_changed",
      details: { userid, new_role: role },
    });
    if (logError) throw logError;
  }
}
