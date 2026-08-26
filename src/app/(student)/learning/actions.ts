"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { VocabRepository } from "@/lib/repositories/vocab.repository";
import { EnrollmentRepository } from "@/lib/repositories/enrollment.repository";
import { GamificationRepository } from "@/lib/repositories/gamification.repository";

async function getRepoAndUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  return {
    repo: new VocabRepository(supabase),
    gamification: new GamificationRepository(supabase),
    userid: user.id,
  };
}

async function getEnrollmentRepoAndStudentId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const repo = new EnrollmentRepository(supabase);
  const studentid = await repo.findStudentIdByUserId(user.id);

  if (!studentid) {
    throw new Error("Student profile not found");
  }

  return { repo, gamification: new GamificationRepository(supabase), studentid, userid: user.id };
}

export async function createCustomCardAction(formData: FormData) {
  const { repo, gamification, userid } = await getRepoAndUserId();

  const front = String(formData.get("front") ?? "").trim();
  const back = String(formData.get("back") ?? "").trim();
  const example =
    String(formData.get("example") ?? "").trim() || null;
  const difficulty =
    String(formData.get("difficulty") ?? "").trim() || null;

  if (!front || !back) return;

  await repo.createCustomCard(userid, front, back, example, difficulty);
  
  // 🎮 Gamification: Award XP and update streak
  await gamification.recordActivity(userid, "vocab_card");

  revalidatePath("/learning");
}

export async function updateCustomCardAction(
  cardid: string,
  formData: FormData
) {
  await getRepoAndUserId();

  const supabase = await createClient();
  const repo = new VocabRepository(supabase);

  const front = String(formData.get("front") ?? "").trim();
  const back = String(formData.get("back") ?? "").trim();
  const example =
    String(formData.get("example") ?? "").trim() || null;
  const difficulty =
    String(formData.get("difficulty") ?? "").trim() || null;

  if (!front || !back) return;

  await repo.updateCustomCard(cardid, {
    front,
    back,
    example,
    difficulty,
  });

  revalidatePath("/learning");
}

export async function deleteCustomCardAction(cardid: string) {
  const { repo } = await getRepoAndUserId();

  await repo.deleteCustomCard(cardid);

  revalidatePath("/learning");
}

export async function toggleSaveWordAction(
  wordid: string,
  currentlySaved: boolean
) {
  const { repo, gamification, userid } = await getRepoAndUserId();

  if (currentlySaved) {
    await repo.unsaveWord(userid, wordid);
  } else {
    await repo.saveWord(userid, wordid);
    // 🎮 Gamification: Award XP for saving a new word
    await gamification.recordActivity(userid, "save_word");
  }

  revalidatePath("/learning");
}

export async function enrollInCourseAction(
  courseid: string,
  batchid?: string | null
) {
  try {
    const { repo, gamification, studentid, userid } =
      await getEnrollmentRepoAndStudentId();

    await repo.enroll(studentid, courseid, batchid);
    
    // 🎮 Gamification: Award XP for enrolling
    await gamification.recordActivity(userid, "enroll");

    revalidatePath("/learning");

    return { success: true };
  } catch (error) {
    console.error("enrollInCourseAction failed:", error);

    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to enroll in this course.",
    };
  }
}

export async function dropCourseAction(enrollid: string) {
  try {
    const { repo } = await getEnrollmentRepoAndStudentId();

    await repo.drop(enrollid);

    revalidatePath("/learning");

    return { success: true };
  } catch (error) {
    console.error("dropCourseAction failed:", error);

    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to drop this course.",
    };
  }
}