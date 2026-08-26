import AiTutor from "@/components/tutor/ai-tutor";
import { getCurrentStudentId } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "AI Tutor — IELTS Beta",
};

export default async function TutorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const studentId = await getCurrentStudentId();

  let firstName = "there";
  if (user) {
    const { data } = await supabase
      .from("users")
      .select("personid, persons(first_name, last_name)")
      .eq("userid", user.id)
      .single();
    const person = (data as unknown as { persons: { first_name: string; last_name: string } | null })
      ?.persons;
    if (person?.first_name) firstName = person.first_name;
  }

  return (
    <div className="px-4 py-8 md:px-8">
      <AiTutor userId={studentId ?? user?.id ?? "guest"} firstName={firstName} />
    </div>
  );
}