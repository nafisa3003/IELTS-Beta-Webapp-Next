"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type OnboardingData = {
  has_taken_ielts?: boolean;
  current_band?: number | null;
  target_band?: number | null;
  test_type?: "academic" | "general" | null;
  exam_date?: string | null;
  focus_areas?: string[];
  onboarding_step?: number;
  onboarding_completed?: boolean;
};

export async function saveOnboarding(data: OnboardingData) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Not authenticated");
  }

  // Upsert into user_onboarding (or update users table)
  const { error } = await supabase
    .from("user_onboarding")
    .upsert(
      {
        user_id: user.id,
        ...data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
}