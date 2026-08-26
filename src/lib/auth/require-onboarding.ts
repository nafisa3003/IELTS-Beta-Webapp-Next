import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function requireOnboarding() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  // CHECK ROLE FIRST — only students need onboarding
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("userid", user.id)
    .single();

  if (profile?.role !== "student") {
    return user; // teachers and admins bypass onboarding entirely
  }

  const { data: onboarding } = await supabase
    .from("user_onboarding")
    .select("onboarding_completed")
    .eq("user_id", user.id)
    .single();

  if (!onboarding || !onboarding.onboarding_completed) {
    redirect("/onboarding/current-band");
  }

  return user;
}