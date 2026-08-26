"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ContentRepository } from "@/lib/repositories/content.repository";
import type { ContentType } from "@/types/courses";

const VALID_TYPES: ContentType[] = ["Video", "PDF", "YouTube", "Notes"];
type ActionResult = { error?: string; success?: boolean } | null;

function parseCommon(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const contentType = String(formData.get("content_type") ?? "") as ContentType;
  const youtubeLink = String(formData.get("youtube_link") ?? "").trim() || null;
  const fileUrl = String(formData.get("file_url") ?? "").trim() || null;
  if (!title) return { error: "Title is required" as const };
  if (!VALID_TYPES.includes(contentType)) return { error: "Pick a valid content type" as const };
  return { title, contentType, youtubeLink, fileUrl };
}

export async function createContentAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const courseid = String(formData.get("courseid") ?? "");
  if (!courseid) return { error: "Pick a course" };
  const parsed = parseCommon(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createClient();
  try {
    await new ContentRepository(supabase).create({
      courseid,
      title: parsed.title,
      content_type: parsed.contentType,
      youtube_link: parsed.youtubeLink,
      file_url: parsed.fileUrl,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't create content" };
  }
  revalidatePath("/admin/content");
  return { success: true };
}

export async function updateContentAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const contentid = String(formData.get("contentid") ?? "");
  if (!contentid) return { error: "Missing content id" };
  const parsed = parseCommon(formData);
  if ("error" in parsed) return parsed;

  const supabase = await createClient();
  try {
    await new ContentRepository(supabase).update(contentid, {
      title: parsed.title,
      content_type: parsed.contentType,
      youtube_link: parsed.youtubeLink,
      file_url: parsed.fileUrl,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't update content" };
  }
  revalidatePath("/admin/content");
  return { success: true };
}

export async function deleteContentAction(contentid: string): Promise<ActionResult> {
  const supabase = await createClient();
  try {
    await new ContentRepository(supabase).delete(contentid);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't delete content" };
  }
  revalidatePath("/admin/content");
  return { success: true };
}
