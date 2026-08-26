"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { LiveClassRepository } from "@/lib/repositories/live-class.repository";

type ActionResult = { error?: string; success?: boolean } | null;

export async function scheduleLiveClassAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const teachercourseid = String(formData.get("teachercourseid") ?? "");
  const meetingLink = String(formData.get("meeting_link") ?? "").trim();
  const classDate = String(formData.get("class_date") ?? "");

  if (!teachercourseid || !meetingLink || !classDate) return { error: "Fill in every field" };

  const supabase = await createClient();
  try {
    await new LiveClassRepository(supabase).create({
      teachercourseid,
      meeting_link: meetingLink,
      class_date: new Date(classDate).toISOString(),
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't schedule class" };
  }
  revalidatePath("/teacher/live-classes");
  revalidatePath("/teacher");
  return { success: true };
}

export async function cancelLiveClassAction(classid: string): Promise<ActionResult> {
  const supabase = await createClient();
  try {
    await new LiveClassRepository(supabase).cancel(classid);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't cancel class" };
  }
  revalidatePath("/teacher/live-classes");
  revalidatePath("/teacher");
  return { success: true };
}
