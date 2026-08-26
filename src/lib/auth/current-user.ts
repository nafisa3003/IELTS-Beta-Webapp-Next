import { createClient } from "@/lib/supabase/server";

export async function getCurrentStudentId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("students")
    .select("studentid")
    .eq("userid", user.id)
    .maybeSingle();
  return data?.studentid ?? null;
}

export async function getCurrentTeacherId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("teachers")
    .select("teacherid")
    .eq("userid", user.id)
    .maybeSingle();
  return data?.teacherid ?? null;
}
