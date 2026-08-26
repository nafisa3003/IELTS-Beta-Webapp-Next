import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { createClient } from "@/lib/supabase/server";
import type { NavRole } from "@/components/shell/top-nav";
import { requireOnboarding } from "@/lib/auth/require-onboarding";

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase.from("users").select("role").eq("userid", user.id).single();
  const role = (data?.role ?? "student") as NavRole;

  await requireOnboarding();
  return <AppShell role={role}>{children}</AppShell>;
}
