import type { SupabaseClient } from "@supabase/supabase-js";

export interface Announcement {
  announcementid: string;
  adminid: string;
  title: string;
  message: string;
  created_at: string;
}

export class AnnouncementRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findAll(): Promise<Announcement[]> {
    const { data, error } = await this.db
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Announcement[];
  }

  async create(adminid: string, title: string, message: string): Promise<Announcement> {
    const { data, error } = await this.db
      .from("announcements")
      .insert({ adminid, title, message })
      .select()
      .single();
    if (error) throw error;
    return data as Announcement;
  }

  async update(announcementid: string, title: string, message: string): Promise<Announcement> {
    const { data, error } = await this.db
      .from("announcements")
      .update({ title, message })
      .eq("announcementid", announcementid)
      .select()
      .single();
    if (error) throw error;
    return data as Announcement;
  }

  async delete(announcementid: string): Promise<void> {
    const { error } = await this.db.from("announcements").delete().eq("announcementid", announcementid);
    if (error) throw error;
  }
}
