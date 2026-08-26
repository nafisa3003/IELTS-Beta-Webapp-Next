"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { UserRepository } from "@/lib/repositories/user.repository";

type ActionResult = { error?: string; success?: boolean } | null;

export async function updateRoleAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const userid = String(formData.get("userid") ?? "");
  const role = String(formData.get("role") ?? "");
  if (!userid || !["student", "teacher", "admin"].includes(role)) {
    return { error: "Invalid role" };
  }

  const supabase = await createClient();
  try {
    await new UserRepository(supabase).updateRole(userid, role as "student" | "teacher" | "admin");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't update role" };
  }
  revalidatePath("/admin/users");
  return { success: true };
}
