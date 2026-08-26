import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { createClient } from "@/lib/supabase/server";
import type { NavRole } from "@/components/shell/top-nav";

export default async function AnnouncementsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase.from("users").select("role").eq("userid", user.id).single();
  const role = (data?.role ?? "student") as NavRole;

  return <AppShell role={role}>{children}</AppShell>;
}
