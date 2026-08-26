"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AnnouncementRepository } from "@/lib/repositories/announcement.repository";
import { getCurrentAdminId } from "@/lib/auth/current-admin";

type ActionResult = { error?: string; success?: boolean } | null;
const REVALIDATE = ["/admin/announcements", "/announcements"];

export async function createAnnouncementAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const adminid = await getCurrentAdminId();
  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!adminid) return { error: "You need an admin account to post announcements" };
  if (!title || !message) return { error: "Title and message are both required" };

  const supabase = await createClient();
  try {
    await new AnnouncementRepository(supabase).create(adminid, title, message);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't post announcement" };
  }
  REVALIDATE.forEach((path) => revalidatePath(path));
  return { success: true };
}

export async function updateAnnouncementAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const announcementid = String(formData.get("announcementid") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!announcementid || !title || !message) return { error: "Title and message are both required" };

  const supabase = await createClient();
  try {
    await new AnnouncementRepository(supabase).update(announcementid, title, message);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't update announcement" };
  }
  REVALIDATE.forEach((path) => revalidatePath(path));
  return { success: true };
}

export async function deleteAnnouncementAction(announcementid: string): Promise<ActionResult> {
  const supabase = await createClient();
  try {
    await new AnnouncementRepository(supabase).delete(announcementid);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't delete announcement" };
  }
  REVALIDATE.forEach((path) => revalidatePath(path));
  return { success: true };
}
