import { createClient } from "@/lib/supabase/server";

export async function getCurrentAdminId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("admins").select("adminid").eq("userid", user.id).maybeSingle();
  return data?.adminid ?? null;
}
