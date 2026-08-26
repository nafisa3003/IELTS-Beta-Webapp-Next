"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AssessmentService } from "@/lib/services/assessment-service";
import { GamificationRepository } from "@/lib/repositories/gamification.repository";
import { getCurrentStudentId } from "@/lib/auth/current-user";
import { submitAnswersSchema } from "@/lib/validations/assessment";

export async function startAttemptAction(testid: string) {
  const studentid = await getCurrentStudentId();
  if (!studentid) throw new Error("No student account for the current user.");

  const supabase = await createClient();
  const service = new AssessmentService(supabase);
  const attempt = await service.startAttempt(studentid, testid);

  redirect(`/practice/attempt/${attempt.attemptid}?testid=${testid}`);
}

export async function submitAttemptAction(formData: FormData): Promise<void> {
  const attemptid = formData.get("attemptid");
  const testid = formData.get("testid");
  const answersJson = formData.get("answers");

  const parsed = submitAnswersSchema.safeParse({
    attemptid,
    testid,
    answers: answersJson ? JSON.parse(String(answersJson)) : {},
  });
  if (!parsed.success) return;

  const supabase = await createClient();
  const service = new AssessmentService(supabase);
  await service.submitAttempt(parsed.data.attemptid, parsed.data.testid, parsed.data.answers);

  // 🎮 Gamification: The DB trigger handles XP for tests, but we also record activity
  // for streak purposes (in case trigger ever fails, this is a safety net)
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const gamification = new GamificationRepository(supabase);
    await gamification.recordActivity(user.id, "test_complete");
  }

  redirect(`/results/${parsed.data.attemptid}`);
}