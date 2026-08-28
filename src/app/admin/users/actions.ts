"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { UserRepository } from "@/lib/repositories/user.repository";
import { getCurrentAdminId } from "@/lib/auth/current-admin";

type ActionResult = { error?: string; success?: boolean } | null;

export async function updateRoleAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const actingAdminId = await getCurrentAdminId();
  if (!actingAdminId) return { error: "You need an admin account" };

  const userid = String(formData.get("userid") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!userid || !["student", "teacher", "admin"].includes(role)) {
    return { error: "Invalid role" };
  }

  const supabase = await createClient();
  try {
    await new UserRepository(supabase).updateRole(userid, role as "student" | "teacher" | "admin", actingAdminId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't update role" };
  }
  revalidatePath("/admin/users");
  return { success: true };
}
