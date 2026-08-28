import type { SupabaseClient } from "@supabase/supabase-js";

export interface ProfileDetail {
  userid: string;
  email: string;
  role: "student" | "teacher" | "admin";
  display_id: string | null;
  created_at: string;
  personid: string;
  first_name: string;
  last_name: string;
  dob: string | null;
  gender: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  target_band: number | null;
  current_band: number | null;
}

export interface UserSettings {
  userid: string;
  email_notifications: boolean;
  streak_reminders: boolean;
}

export class ProfileRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findByUserId(userid: string): Promise<ProfileDetail | null> {
    const { data, error } = await this.db
      .from("users")
      .select(
        "userid, email, role, created_at, personid, persons(first_name, last_name, dob, gender, phone, address, avatar_url), students(target_band, current_band, display_id), teachers(display_id), admins(display_id)"
      )
      .eq("userid", userid)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const row = data as unknown as {
      userid: string;
      email: string;
      role: ProfileDetail["role"];
      created_at: string;
      personid: string;
      persons: {
        first_name: string;
        last_name: string;
        dob: string | null;
        gender: string | null;
        phone: string | null;
        address: string | null;
        avatar_url: string | null;
      } | null;
      students:
        | {
            target_band: number | null;
            current_band: number | null;
            display_id: string | null;
          }[]
        | null;
      teachers: { display_id: string | null }[] | null;
      admins: { display_id: string | null }[] | null;
    };

    const displayId =
      row.students?.[0]?.display_id ??
      row.teachers?.[0]?.display_id ??
      row.admins?.[0]?.display_id ??
      null;

    return {
      userid: row.userid,
      email: row.email,
      role: row.role,
      display_id: displayId,
      created_at: row.created_at,
      personid: row.personid,
      first_name: row.persons?.first_name ?? "",
      last_name: row.persons?.last_name ?? "",
      dob: row.persons?.dob ?? null,
      gender: row.persons?.gender ?? null,
      phone: row.persons?.phone ?? null,
      address: row.persons?.address ?? null,
      avatar_url: row.persons?.avatar_url ?? null,
      target_band: row.students?.[0]?.target_band ?? null,
      current_band: row.students?.[0]?.current_band ?? null,
    };
  }

  async updatePerson(
    personid: string,
    fields: Partial<
      Pick<
        ProfileDetail,
        | "first_name"
        | "last_name"
        | "dob"
        | "gender"
        | "phone"
        | "address"
        | "avatar_url"
      >
    >
  ): Promise<void> {
    const { data, error } = await this.db
      .from("persons")
      .update(fields)
      .eq("personid", personid)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error(
        "updatePerson matched no rows — check RLS UPDATE policy on persons"
      );
    }
  }

  async updateTargetBand(
    studentid: string,
    targetBand: number
  ): Promise<void> {
    const { error } = await this.db
      .from("students")
      .update({ target_band: targetBand })
      .eq("studentid", studentid);

    if (error) throw error;
  }

  async updateCurrentBand(
    studentid: string,
    currentBand: number
  ): Promise<void> {
    const { error } = await this.db
      .from("students")
      .update({ current_band: currentBand })
      .eq("studentid", studentid);

    if (error) throw error;
  }

  async findSettings(userid: string): Promise<UserSettings | null> {
    const { data, error } = await this.db
      .from("user_settings")
      .select("userid, email_notifications, streak_reminders")
      .eq("userid", userid)
      .maybeSingle();

    if (error) throw error;

    return data as UserSettings | null;
  }

  async updateSettings(
    userid: string,
    fields: Partial<
      Pick<UserSettings, "email_notifications" | "streak_reminders">
    >
  ): Promise<void> {
    const { error } = await this.db
      .from("user_settings")
      .upsert({
        userid,
        ...fields,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;
  }
}
