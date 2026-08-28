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

  // Upsert into user_onboarding
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

  // Also explicitly sync to students table (backup in case trigger fails)
  if (data.current_band !== undefined || data.target_band !== undefined) {
    const { data: student } = await supabase
      .from("students")
      .select("studentid")
      .eq("userid", user.id)
      .maybeSingle();

    if (student) {
      const updateData: Record<string, number> = {};
      if (data.current_band !== undefined && data.current_band !== null) {
        updateData.current_band = data.current_band;
      }
      if (data.target_band !== undefined && data.target_band !== null) {
        updateData.target_band = data.target_band;
      }

      if (Object.keys(updateData).length > 0) {
        const { error: studentError } = await supabase
          .from("students")
          .update(updateData)
          .eq("studentid", student.studentid);

        if (studentError) {
          console.error("Failed to sync onboarding bands to students:", studentError);
        }
      }
    }
  }

  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
  revalidatePath("/profile");
}
