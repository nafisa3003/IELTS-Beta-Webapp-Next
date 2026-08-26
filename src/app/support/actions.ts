"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SupportTicketRepository } from "@/lib/repositories/support-ticket.repository";
import { getCurrentStudentId } from "@/lib/auth/current-user";

type ActionResult = { error?: string; success?: boolean } | null;

export async function createSupportTicketAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const studentid = await getCurrentStudentId();
  if (!studentid) return { error: "You need a student account to open a ticket" };

  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!subject || !message) return { error: "Subject and message are both required" };

  const supabase = await createClient();
  try {
    await new SupportTicketRepository(supabase).create(studentid, subject, message);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't submit your ticket" };
  }
  revalidatePath("/support");
  revalidatePath("/admin/support");
  return { success: true };
}
