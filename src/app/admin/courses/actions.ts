"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CourseService } from "@/lib/services/course-service";
import { createCourseSchema, updateCourseSchema } from "@/lib/validations/course";

type ActionResult = { error?: string; success?: boolean } | null;

export async function createCourseAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = createCourseSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    level: formData.get("level") || undefined,
    duration: formData.get("duration") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const service = new CourseService(supabase);
  try {
    await service.createCourse({
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      level: parsed.data.level ?? null,
      duration: parsed.data.duration ?? null,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't create course" };
  }

  revalidatePath("/admin/courses");
  return { success: true };
}

export async function updateCourseAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = updateCourseSchema.safeParse({
    courseid: formData.get("courseid"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    level: formData.get("level") || undefined,
    duration: formData.get("duration") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const service = new CourseService(supabase);
  try {
    await service.updateCourse(parsed.data.courseid, {
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      level: parsed.data.level ?? null,
      duration: parsed.data.duration ?? null,
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't update course" };
  }

  revalidatePath("/admin/courses");
  return { success: true };
}

export async function deleteCourseAction(courseid: string): Promise<ActionResult> {
  const supabase = await createClient();
  const service = new CourseService(supabase);
  try {
    await service.deleteCourse(courseid);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't delete course" };
  }
  revalidatePath("/admin/courses");
  return { success: true };
}

export async function assignTeacherAction(formData: FormData): Promise<ActionResult> {
  const teacherid = formData.get("teacherid") as string;
  const courseid = formData.get("courseid") as string;
  if (!teacherid || !courseid) return { error: "Pick a teacher first" };

  const supabase = await createClient();
  const service = new CourseService(supabase);
  try {
    await service.assignTeacherToCourse(teacherid, courseid);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't assign teacher" };
  }
  revalidatePath("/admin/courses");
  return { success: true };
}

export async function unassignTeacherAction(teachercourseid: string): Promise<ActionResult> {
  const supabase = await createClient();
  const service = new CourseService(supabase);
  try {
    await service.unassignTeacherFromCourse(teachercourseid);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't remove teacher" };
  }
  revalidatePath("/admin/courses");
  return { success: true };
}

export async function updateEnrollmentStatusAction(
  enrollid: string,
  status: "active" | "completed" | "dropped"
): Promise<ActionResult> {
  const supabase = await createClient();
  const service = new CourseService(supabase);
  try {
    await service.updateEnrollmentStatus(enrollid, status);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Couldn't update enrollment" };
  }
  revalidatePath("/admin/courses");
  return { success: true };
}
