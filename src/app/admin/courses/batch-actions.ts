"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CourseBatchRepository } from "@/lib/repositories/course-batch.repository";

type ActionResult = { error?: string; success?: boolean } | null;

export async function createBatchAction(formData: FormData): Promise<ActionResult> {
  const courseid = String(formData.get("courseid") ?? "");
  const startsOn = String(formData.get("starts_on") ?? "") || null;
  const seatsRaw = String(formData.get("seats_total") ?? "");
  const deadline = String(formData.get("enrollment_deadline") ?? "") || null;
  if (!courseid) return { error: "Missing course" };

  const supabase = await createClient();
  const repo = new CourseBatchRepository(supabase);
  try {
    const batch_number = await repo.nextBatchNumber(courseid);
    const { data: course } = await supabase.from("courses").select("course_code").eq("courseid", courseid).single();
    const batch_code = `${course?.course_code ?? "C"}-B${batch_number}`;
    await repo.create({
      courseid,
      batch_number,
      batch_code,
      starts_on: startsOn,
      seats_total: seatsRaw ? Number(seatsRaw) : null,
      enrollment_deadline: deadline,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't create batch" };
  }
  revalidatePath("/admin/courses");
  revalidatePath("/learning");
  return { success: true };
}

export async function deactivateBatchAction(batchid: string): Promise<ActionResult> {
  const supabase = await createClient();
  try {
    await new CourseBatchRepository(supabase).deactivate(batchid);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't close batch" };
  }
  revalidatePath("/admin/courses");
  revalidatePath("/learning");
  return { success: true };
}
