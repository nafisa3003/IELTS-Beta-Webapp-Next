"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SupportTicketRepository, type TicketStatus } from "@/lib/repositories/support-ticket.repository";
import { getCurrentAdminId } from "@/lib/auth/current-admin";

type ActionResult = { error?: string; success?: boolean } | null;

export async function updateTicketStatusAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const adminid = await getCurrentAdminId();
  const ticketid = String(formData.get("ticketid") ?? "");
  const status = String(formData.get("status") ?? "") as TicketStatus;
  if (!adminid) return { error: "You need an admin account" };
  if (!ticketid || !["Open", "InProgress", "Resolved"].includes(status)) return { error: "Invalid status" };

  const supabase = await createClient();
  try {
    await new SupportTicketRepository(supabase).updateStatus(ticketid, status, adminid);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't update ticket" };
  }
  revalidatePath("/admin/support");
  revalidatePath("/support");
  return { success: true };
}
